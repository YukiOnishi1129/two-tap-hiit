import { HomeScreenPresenter } from './HomeScreenPresenter';
import { useHomeScreen } from './useHomeScreen';

export function HomeScreenContainer() {
  return <HomeScreenPresenter {...useHomeScreen()} />;
}
