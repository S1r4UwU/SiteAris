"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  Loader2, 
  RefreshCcw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getServerChatClient, ChatMessage, ChatConversation } from '@/lib/supabase/chat-support';
import { createClient } from '@/lib/supabase/client';

/**
 * Tableau de bord d'administration pour le chat support
 * Permet aux agents de support de gérer les conversations
 */
export function SupportChatDashboard() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Charger les conversations au chargement du composant
  useEffect(() => {
    loadConversations();
  }, []);

  // Filtrer les conversations lorsque le filtre ou la recherche change
  useEffect(() => {
    filterConversations();
  }, [conversations, filter, searchTerm]);

  // Charger les messages lorsqu'une conversation est sélectionnée
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  // S'abonner aux nouveaux messages de la conversation active
  useEffect(() => {
    if (!activeConversation) return;
    
    const channel = supabase
      .channel(`conversation:${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  // Scroll vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Charger toutes les conversations
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const serverClient = await getServerChatClient();
      const allConversations = await serverClient.getAllConversations();
      setConversations(allConversations);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les conversations selon les critères
  const filterConversations = () => {
    let filtered = [...conversations];
    
    // Filtrer par statut
    if (filter !== 'all') {
      filtered = filtered.filter(conv => conv.status === filter.toUpperCase());
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.subject.toLowerCase().includes(term) || 
        conv.last_message?.toLowerCase().includes(term) ||
        conv.user?.email?.toLowerCase().includes(term) ||
        conv.user?.first_name?.toLowerCase().includes(term) ||
        conv.user?.last_name?.toLowerCase().includes(term)
      );
    }
    
    setFilteredConversations(filtered);
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setMessages(data);
      
      // Marquer les messages comme lus
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'USER');
        
      // Mettre à jour le compteur de messages non lus dans la liste des conversations
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ));
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const serverClient = await getServerChatClient();
      const sentMessage = await serverClient.sendSupportMessage(
        activeConversation.id,
        session.user.id,
        newMessage
      );
      
      if (sentMessage) {
        setNewMessage('');
        
        // Mettre à jour le statut de la conversation dans la liste
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id ? { ...conv, status: 'PENDING' } : conv
        ));
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Mettre à jour le statut d'une conversation
  const updateConversationStatus = async (conversationId: string, status: 'OPEN' | 'CLOSED' | 'PENDING') => {
    try {
      const serverClient = await getServerChatClient();
      const success = await serverClient.updateConversationStatus(conversationId, status);
      
      if (success) {
        // Mettre à jour le statut dans la liste des conversations
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId ? { ...conv, status } : conv
        ));
        
        // Mettre à jour le statut de la conversation active
        if (activeConversation && activeConversation.id === conversationId) {
          setActiveConversation({ ...activeConversation, status });
        }
        
        // Envoyer un message système pour indiquer le changement de statut
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const statusMessage = status === 'CLOSED' 
            ? 'Cette conversation a été marquée comme fermée par un agent de support.'
            : status === 'OPEN' 
              ? 'Cette conversation a été rouverte par un agent de support.'
              : 'Cette conversation est en attente de réponse du client.';
          
          await supabase.from('chat_messages').insert({
            id: crypto.randomUUID(),
            conversation_id: conversationId,
            sender_id: session.user.id,
            sender_type: 'SYSTEM',
            content: statusMessage,
            read: true
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Ouvert</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">En attente</Badge>;
      case 'CLOSED':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Fermé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Support Client</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadConversations}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 gap-4 h-[calc(100vh-200px)]">
        {/* Liste des conversations */}
        <div className="w-1/3 flex flex-col border rounded-md">
          <div className="p-3 border-b">
            <div className="flex gap-2 mb-2">
              <Input 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select 
                value={filter} 
                onValueChange={setFilter}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="open">Ouverts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="closed">Fermés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filteredConversations.length} conversation(s)</span>
              <span>
                {conversations.filter(c => c.status === 'OPEN').length} ouvert(s),&nbsp;
                {conversations.filter(c => c.status === 'PENDING').length} en attente
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading && conversations.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conversation => (
                <div 
                  key={conversation.id} 
                  className={`p-3 border-b cursor-pointer hover:bg-muted transition-colors ${
                    activeConversation?.id === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{conversation.subject}</h4>
                    {conversation.unread_count ? (
                      <Badge className="bg-primary">{conversation.unread_count}</Badge>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <span>
                      {conversation.user?.first_name} {conversation.user?.last_name}
                    </span>
                    <span>•</span>
                    <span>{conversation.user?.email}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.last_message || 'Pas de messages'}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.updated_at)}
                    </span>
                    {getStatusBadge(conversation.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucune conversation trouvée</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Détail de la conversation */}
        <div className="w-2/3 flex flex-col border rounded-md">
          {activeConversation ? (
            <>
              <div className="p-3 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{activeConversation.subject}</h3>
                  <div className="text-sm text-muted-foreground">
                    <span>
                      {activeConversation.user?.first_name} {activeConversation.user?.last_name}
                    </span>
                    <span> • </span>
                    <span>{activeConversation.user?.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(activeConversation.status)}
                  <Select 
                    value={activeConversation.status.toLowerCase()} 
                    onValueChange={(value) => updateConversationStatus(
                      activeConversation.id, 
                      value.toUpperCase() as 'OPEN' | 'CLOSED' | 'PENDING'
                    )}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Ouvert
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                          En attente
                        </div>
                      </SelectItem>
                      <SelectItem value="closed">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                          Fermé
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${
                        message.sender_type === 'USER' 
                          ? 'justify-start' 
                          : message.sender_type === 'SYSTEM'
                            ? 'justify-center'
                            : 'justify-end'
                      }`}
                    >
                      {message.sender_type === 'SYSTEM' ? (
                        <div className="bg-gray-100 text-gray-600 text-xs py-1 px-3 rounded-full">
                          {message.content}
                        </div>
                      ) : (
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender_type === 'USER' 
                            ? 'bg-muted rounded-bl-none' 
                            : 'bg-primary text-white rounded-br-none'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_type === 'USER' ? 'text-muted-foreground' : 'text-primary-100'
                          }`}>
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Aucun message dans cette conversation</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-3 border-t">
                <div className="flex">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    className="flex-1 min-h-[80px] max-h-[200px]"
                    disabled={activeConversation.status === 'CLOSED' || isSending}
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
                    disabled={!newMessage.trim() || activeConversation.status === 'CLOSED' || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {activeConversation.status === 'CLOSED' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Cette conversation est fermée. Changez son statut pour continuer à échanger.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">Aucune conversation sélectionnée</h3>
              <p className="text-muted-foreground">
                Sélectionnez une conversation dans la liste pour afficher les messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 