insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lesson-pdfs', 'lesson-pdfs', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "teachers manage own lesson PDFs"
on storage.objects for all
using (
  bucket_id = 'lesson-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'lesson-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
