import { TaggedActionsController } from './tagged-actions.controller';
import { TaggedActionsService } from './tagged-actions.service';

describe('TaggedActionsController', () => {
  it('delegates deletion with both route identifiers', async () => {
    const removeFromSession = jest.fn().mockResolvedValue(undefined);
    const controller = new TaggedActionsController({
      removeFromSession,
    } as unknown as TaggedActionsService);

    await expect(
      controller.removeFromSession('session-id', 'action-id'),
    ).resolves.toBeUndefined();
    expect(removeFromSession).toHaveBeenCalledWith('session-id', 'action-id');
  });
});
