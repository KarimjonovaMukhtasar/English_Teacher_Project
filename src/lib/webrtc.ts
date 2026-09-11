import Peer, { DataConnection } from 'peerjs';
import { RemoteCommand } from '@/types';
import { presentationActions, presentationStore } from '@/store';
import { authStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

const commandTypes = new Set<RemoteCommand['type']>([
  'NEXT_SLIDE', 'PREV_SLIDE', 'START_TIMER', 'PAUSE_TIMER', 'RESET_TIMER',
  'TOGGLE_BLACKOUT', 'TOGGLE_WHITEOUT', 'PICK_STUDENT', 'TOGGLE_PEDAGOGY',
  'TOGGLE_TRANSLATION_CURTAIN', 'GET_HOST_STATE',
]);

const isRemoteCommand = (value: unknown): value is RemoteCommand =>
  Boolean(value) && typeof value === 'object' && commandTypes.has((value as { type?: RemoteCommand['type'] }).type as RemoteCommand['type']);

const isAuthMessage = (value: unknown): value is { type: 'AUTH'; payload: { accessToken: string } } => {
  if (!value || typeof value !== 'object') return false;
  const message = value as { type?: unknown; payload?: { accessToken?: unknown } };
  return message.type === 'AUTH' && typeof message.payload?.accessToken === 'string';
};

class WebRTCManager {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private isHost = false;
  private onStateChangeCallback?: (state: unknown) => void;

  public getIsHost() {
    return this.isHost;
  }

  public initHost(sessionId: string, onConnected?: () => void) {
    this.destroy();
    this.isHost = true;
    this.peer = new Peer(`etps-${sessionId}`);

    this.peer.on('connection', (conn) => {
      let authorized = false;
      const expiry = window.setTimeout(() => conn.close(), 10_000);

      conn.on('open', () => {
        conn.on('data', async (data: unknown) => {
          if (!authorized) {
            if (!isAuthMessage(data) || !supabase || !authStore.state.currentUser.id) {
              conn.close();
              return;
            }
            const { data: verified, error } = await supabase.auth.getUser(data.payload.accessToken);
            if (error || verified.user?.id !== authStore.state.currentUser.id) {
              conn.close();
              return;
            }
            authorized = true;
            window.clearTimeout(expiry);
            this.connection = conn;
            presentationActions.setIsRemoteConnected(true);
            onConnected?.();
            this.sendHostState();
            return;
          }
          if (isRemoteCommand(data)) this.handleIncomingCommand(data);
        });
      });

      conn.on('close', () => {
        if (this.connection === conn) {
          presentationActions.setIsRemoteConnected(false);
          this.connection = null;
        }
      });
      conn.on('error', () => conn.close());
    });

    this.peer.on('error', () => presentationActions.setIsRemoteConnected(false));
  }

  public sendHostState() {
    if (!this.connection?.open) return;
    const state = presentationStore.state;
    this.connection.send({
      type: 'HOST_STATE',
      payload: {
        currentSlideIndex: state.currentSlideIndex,
        totalSlides: state.totalSlides,
        isTimerRunning: state.isTimerRunning,
        timerSeconds: state.timerSeconds,
        isTimerOpen: state.isTimerOpen,
        selectedStudent: null,
        isBlackout: state.isBlackout,
        isWhiteout: state.isWhiteout,
        lessonTitle: state.currentLesson?.title || 'Dars',
        isPedagogyModalOpen: state.isPedagogyModalOpen,
        isTranslationCurtainActive: state.isTranslationCurtainActive,
      },
    });
  }

  private handleIncomingCommand(command: RemoteCommand) {
    switch (command.type) {
      case 'NEXT_SLIDE': presentationActions.nextSlide(); break;
      case 'PREV_SLIDE': presentationActions.prevSlide(); break;
      case 'START_TIMER': presentationActions.startTimer(); break;
      case 'PAUSE_TIMER': presentationActions.pauseTimer(); break;
      case 'RESET_TIMER': presentationActions.resetTimer(); break;
      case 'TOGGLE_BLACKOUT': presentationActions.toggleBlackout(); break;
      case 'TOGGLE_WHITEOUT': presentationActions.toggleWhiteout(); break;
      case 'PICK_STUDENT': presentationActions.triggerRandomPick(); break;
      case 'TOGGLE_PEDAGOGY': presentationActions.togglePedagogyModal(); break;
      case 'TOGGLE_TRANSLATION_CURTAIN': presentationActions.toggleTranslationCurtain(); break;
      case 'GET_HOST_STATE': break;
    }
    this.sendHostState();
  }

  public initClient(hostSessionId: string, onStateUpdate: (state: unknown) => void, onConnected?: () => void) {
    this.destroy();
    this.isHost = false;
    this.onStateChangeCallback = onStateUpdate;
    this.peer = new Peer();

    this.peer.on('open', async () => {
      const sessionResult = await supabase?.auth.getSession();
      const accessToken = sessionResult?.data.session?.access_token;
      if (!accessToken || !this.peer) return;
      const conn = this.peer.connect(`etps-${hostSessionId}`);
      this.connection = conn;
      conn.on('open', () => conn.send({ type: 'AUTH', payload: { accessToken } }));
      conn.on('data', (message: unknown) => {
        if (message && typeof message === 'object' && (message as { type?: string }).type === 'HOST_STATE') {
          this.onStateChangeCallback?.((message as { payload: unknown }).payload);
          onConnected?.();
        }
      });
      conn.on('close', () => presentationActions.setIsRemoteConnected(false));
      conn.on('error', () => conn.close());
    });
  }

  public sendCommand(command: RemoteCommand) {
    if (this.connection?.open && isRemoteCommand(command)) this.connection.send(command);
  }

  public destroy() {
    presentationActions.setIsRemoteConnected(false);
    this.connection?.close();
    this.connection = null;
    this.peer?.destroy();
    this.peer = null;
  }
}

export const webrtcManager = new WebRTCManager();
