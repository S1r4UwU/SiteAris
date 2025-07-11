-- Schéma pour le système de chat support en temps réel
-- À exécuter dans Supabase SQL Editor

-- Table des conversations de chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'PENDING', 'CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des messages de chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('USER', 'SUPPORT', 'SYSTEM')),
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON chat_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);

-- Trigger pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION update_chat_updated_at();

-- Fonction pour mettre à jour le statut de la conversation quand un utilisateur envoie un message
CREATE OR REPLACE FUNCTION update_conversation_status_on_user_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_type = 'USER' THEN
    UPDATE chat_conversations
    SET status = 'OPEN', updated_at = now()
    WHERE id = NEW.conversation_id AND status = 'PENDING';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux nouveaux messages
CREATE TRIGGER update_conversation_status_on_user_message_trigger
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_status_on_user_message();

-- Politiques RLS pour sécuriser les données
-- Politique pour les conversations: les utilisateurs ne peuvent voir que leurs propres conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON chat_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
ON chat_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON chat_conversations FOR UPDATE
USING (auth.uid() = user_id);

-- Politique pour les messages: les utilisateurs ne peuvent voir que les messages de leurs conversations
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  ) AND sender_type = 'USER' AND sender_id = auth.uid()
);

-- Politique pour les administrateurs: accès complet aux conversations et messages
CREATE POLICY "Admins have full access to conversations"
ON chat_conversations FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins have full access to messages"
ON chat_messages FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

-- Politique pour les agents de support: accès en lecture à toutes les conversations et messages
CREATE POLICY "Support agents can view all conversations"
ON chat_conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'SUPPORT'
  )
);

CREATE POLICY "Support agents can update conversations"
ON chat_conversations FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'SUPPORT'
  )
);

CREATE POLICY "Support agents can view all messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'SUPPORT'
  )
);

CREATE POLICY "Support agents can insert messages as SUPPORT"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'SUPPORT'
  ) AND sender_type = 'SUPPORT'
);

-- Activer Realtime pour les tables de chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages; 