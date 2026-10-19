import ContentEditorPage from '@/components/admin/ContentEditorPage';

export default function Page({ params }) {
  return <ContentEditorPage typeKey="conditions" id={params.id} />;
}
