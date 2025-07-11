"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { chatClient, ChatMessage, ChatConversation } from '@/lib/supabase/chat-support';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Widget de chat support en temps réel
 * S'affiche en bas à droite de l'écran
 */
export function ChatSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationSubject, setNewConversationSubject] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isLoading: authLoading } = useAuth();

  // Charger les conversations au chargement du composant
  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  // Charger les messages lorsqu'une conversation est sélectionnée
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      // Marquer les messages comme lus
      chatClient.markConversationAsRead(activeConversation.id);
    }
  }, [activeConversation]);

  // S'abonner aux nouveaux messages de la conversation active
  useEffect(() => {
    if (!activeConversation) return;
    
    const unsubscribe = chatClient.subscribeToConversation(
      activeConversation.id,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        
        // Marquer comme lu si c'est un message du support
        if (newMessage.sender_type === 'SUPPORT') {
          chatClient.markConversationAsRead(activeConversation.id);
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [activeConversation]);

  // Scroll vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Charger les conversations de l'utilisateur
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const userConversations = await chatClient.getUserConversations();
      setConversations(userConversations);
      
      // Sélectionner la première conversation ouverte s'il y en a une
      const openConversation = userConversations.find(conv => conv.status !== 'CLOSED');
      if (openConversation) {
        setActiveConversation(openConversation);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const conversationMessages = await chatClient.getConversationMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    
    const tempMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: activeConversation.id,
      sender_id: user?.id || '',
      sender_type: 'USER' as const,
      content: message,
      created_at: new Date().toISOString(),
      read: false
    };
    
    // Ajouter le message temporairement pour une UX réactive
    setMessages(prev => [...prev, tempMessage]);
    setMessage('');
    
    try {
      const sentMessage = await chatClient.sendMessage(activeConversation.id, message);
      
      if (sentMessage) {
        // Remplacer le message temporaire par le message envoyé
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        ));
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  // Créer une nouvelle conversation
  const createNewConversation = async () => {
    if (!message.trim() || !newConversationSubject.trim()) return;
    
    setIsLoading(true);
    try {
      const newConversation = await chatClient.createConversation(
        newConversationSubject,
        message
      );
      
      if (newConversation) {
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
        setMessage('');
        setNewConversationSubject('');
        setShowNewConversation(false);
        
        // Charger les messages de la nouvelle conversation
        loadMessages(newConversation.id);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formater la date d'un message
  const formatMessageDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
  };

  // Si l'utilisateur n'est pas connecté, afficher un bouton pour se connecter
  if (!user && !authLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => window.location.href = '/auth'}
          className="rounded-full p-3 h-12 w-12 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Widget fermé */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full p-3 h-12 w-12 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Widget ouvert */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-xl flex flex-col ${isExpanded ? 'w-96 h-[500px]' : 'w-80 h-[400px]'} transition-all duration-200 ease-in-out`}>
          {/* En-tête */}
          <div className="bg-primary text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Support SiteAris</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-white hover:bg-primary-700"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-white hover:bg-primary-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Corps du chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Liste des conversations */}
            {!activeConversation && !showNewConversation && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Vos conversations</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewConversation(true)}
                  >
                    Nouvelle conversation
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map(conversation => (
                    <div 
                      key={conversation.id} 
                      className="border rounded-md p-3 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">{conversation.subject}</h5>
                        {conversation.unread_count ? (
                          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                            {conversation.unread_count}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message || 'Pas de messages'}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true, locale: fr })}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          conversation.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                          conversation.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.status === 'OPEN' ? 'Ouvert' :
                           conversation.status === 'PENDING' ? 'En attente' :
                           'Fermé'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune conversation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Commencez une nouvelle conversation pour obtenir de l'aide
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Formulaire de nouvelle conversation */}
            {showNewConversation && (
              <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center mb-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => setShowNewConversation(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                  <h4 className="font-medium">Nouvelle conversation</h4>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Sujet</label>
                    <input
                      type="text"
                      value={newConversationSubject}
                      onChange={(e) => setNewConversationSubject(e.target.value)}
                      placeholder="Ex: Problème de configuration réseau"
                      className="w-full border rounded-md p-2 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Message</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez votre problème en détail..."
                      className="w-full min-h-[100px]"
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={createNewConversation}
                    disabled={!message.trim() || !newConversationSubject.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      'Démarrer la conversation'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Messages de la conversation active */}
            {activeConversation && (
              <>
                <div className="p-3 border-b flex items-center justify-between">
                  <div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mb-1"
                      onClick={() => setActiveConversation(null)}
                    >
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Retour
                    </Button>
                    <h4 className="font-medium">{activeConversation.subject}</h4>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeConversation.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    activeConversation.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activeConversation.status === 'OPEN' ? 'Ouvert' :
                     activeConversation.status === 'PENDING' ? 'En attente' :
                     'Fermé'}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {isLoading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender_type === 'USER' 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-muted rounded-bl-none'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_type === 'USER' ? 'text-primary-100' : 'text-muted-foreground'
                          }`}>
                            {formatMessageDate(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Aucun message</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Envoyez un message pour démarrer la conversation
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Formulaire d'envoi de message */}
                <div className="p-3 border-t">
                  <div className="flex">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 min-h-[40px] max-h-[120px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="ml-2 self-end" 
                      onClick={sendMessage}
                      disabled={!message.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 