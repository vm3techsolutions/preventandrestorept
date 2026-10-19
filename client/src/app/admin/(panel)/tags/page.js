import TaxonomyManager from '@/components/admin/TaxonomyManager';
import { PageHeader } from '@/components/admin/ui';

export default function Page() {
  return (
    <div>
      <PageHeader title="Tags" subtitle="Assign multiple tags to blogs. Items in use cannot be deleted." />
      <TaxonomyManager kind="tags" />
    </div>
  );
}
