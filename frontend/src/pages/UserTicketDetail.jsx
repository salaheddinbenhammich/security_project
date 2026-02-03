import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/services/api";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("fr-FR");
};

export default function UserTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (err) {
      setError("Impossible de charger le ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    try {
      const response = await api.post(`/tickets/${id}/comments`, {
        content: commentContent,
      });
      setCommentContent("");
      setTicket((prev) => ({
        ...prev,
        comments: [response.data, ...(prev?.comments || [])],
        commentCount: (prev?.commentCount || 0) + 1,
      }));
    } catch (err) {
      setError("Impossible d'ajouter le commentaire.");
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;
    try {
      const response = await api.put(`/tickets/${id}/comments/${commentId}`, {
        content: editingContent,
      });
      setTicket((prev) => ({
        ...prev,
        comments: (prev?.comments || []).map((comment) =>
          comment.id === commentId ? response.data : comment
        ),
      }));
      cancelEdit();
    } catch (err) {
      setError("Impossible de modifier le commentaire.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/tickets/${id}/comments/${commentId}`);
      setTicket((prev) => ({
        ...prev,
        comments: (prev?.comments || []).filter((comment) => comment.id !== commentId),
        commentCount: Math.max((prev?.commentCount || 1) - 1, 0),
      }));
    } catch (err) {
      setError("Impossible de supprimer le commentaire.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
        <div className="mx-auto max-w-4xl">Chargement...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
        <div className="mx-auto max-w-4xl">{error || "Ticket introuvable"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link to="/user">? Retour mes tickets</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex-1">
            Ticket #{ticket.id}
          </h1>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{ticket.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900 leading-relaxed">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-gray-500 block">Priorité</span><div className="font-semibold">{ticket.priority}</div></div>
              <div><span className="text-gray-500 block">Statut</span><Badge variant="destructive">{ticket.status}</Badge></div>
              <div><span className="text-gray-500 block">Catégorie</span><div>{ticket.category}</div></div>
              <div><span className="text-gray-500 block">Créé le</span><div>{formatDateTime(ticket.createdAt)}</div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes commentaires</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}

            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Ajouter un commentaire..."
              rows={3}
            />
            <Button onClick={handleAddComment}>Ajouter</Button>

            <div className="space-y-4">
              {(ticket.comments || []).length === 0 && (
                <p className="text-sm text-gray-500">Aucun commentaire pour ce ticket.</p>
              )}

              {(ticket.comments || []).map((comment) => {
                const isOwner = currentUser && comment.authorId === currentUser.id;
                return (
                  <div key={comment.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{comment.authorFullName || comment.authorUsername}</span>
                        <span className="ml-2 text-xs text-gray-400">{formatDateTime(comment.createdAt)}</span>
                      </div>
                      {isOwner && (
                        <div className="flex items-center gap-2 text-xs">
                          <Button size="sm" variant="outline" onClick={() => startEdit(comment)}>
                            Modifier
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteComment(comment.id)}>
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>
                            Enregistrer
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-gray-800">{comment.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
