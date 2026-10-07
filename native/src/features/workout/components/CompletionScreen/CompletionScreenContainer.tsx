import { CompletionScreenPresenter } from './CompletionScreenPresenter';
import { type CompletionParams, useCompletionScreen } from './useCompletionScreen';

export function CompletionScreenContainer(props: CompletionParams) {
  return <CompletionScreenPresenter {...useCompletionScreen(props)} />;
}
