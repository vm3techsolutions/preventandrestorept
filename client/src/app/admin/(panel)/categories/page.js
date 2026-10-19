import TaxonomyManager from '@/components/admin/TaxonomyManager';
import { PageHeader } from '@/components/admin/ui';

export default function Page() {
  return (
    <div>
      <PageHeader title="Categories" subtitle="Assign multiple categories to blogs. Items in use cannot be deleted." />
      <TaxonomyManager kind="categories" />
    </div>
  );
}
