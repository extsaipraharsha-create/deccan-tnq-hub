import { toast } from "sonner";

const UNDO_WINDOW_MS = 5000;

/**
 * Fires `onConfirm` after a short grace window unless the user clicks "Undo" on the
 * toast, calling `onCancel` instead. Caller is expected to optimistically hide the
 * item immediately and restore it from `onCancel`.
 */
export function undoableAction(
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void,
) {
  let settled = false;
  const timer = setTimeout(() => {
    if (settled) return;
    settled = true;
    onConfirm();
  }, UNDO_WINDOW_MS);

  toast(message, {
    duration: UNDO_WINDOW_MS,
    action: {
      label: "Undo",
      onClick: () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        onCancel?.();
      },
    },
  });
}
