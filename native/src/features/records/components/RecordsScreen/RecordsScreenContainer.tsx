import { RecordsScreenPresenter } from './RecordsScreenPresenter';
import { useRecordsScreen } from './useRecordsScreen';

export function RecordsScreenContainer() {
  return <RecordsScreenPresenter {...useRecordsScreen()} />;
}
