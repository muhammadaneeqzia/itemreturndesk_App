-- Run once in Supabase SQL Editor if My Chats badges never clear after reading.
-- Existing policy only allowed UPDATE where auth.uid() = sender_id; mark-as-read updates the other party's rows.

DROP POLICY IF EXISTS "Participants can mark received messages read" ON public.messages;

CREATE POLICY "Participants can mark received messages read"
  ON public.messages FOR UPDATE
  USING (
    sender_id IS DISTINCT FROM auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    sender_id IS DISTINCT FROM auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );
