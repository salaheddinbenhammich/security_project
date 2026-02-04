import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getUser } from "@/utils/auth";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("fr-FR");
};

function StatusBadge({ status }) {
  const variant =
    status === "PENDING" ? "secondary" :
    status === "IN_PROGRESS" ? "default" :
    status === "RESOLVED" ? "outline" :
    status === "CLOSED" ? "secondary" :
    "destructive";
  return <Badge variant={variant}>{status}</Badge>;
}

export default function UserTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentForm, setCommentForm] = useState({ content: "" });
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const currentUser = getUser();

  const loadTicket = async () => {
    const response = await api.get(`/tickets/${id}`);
    setTicket(response.data);
  };

  const loadComments = async () => {
    const response = await api.get(`/tickets/${id}/comments`);
    setComments(response.data || []);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadTicket(), loadComments()]);
      } catch (err) {
        if (active) {
          setError("Impossible de charger les details du ticket.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [id]);

  const handleAddComment = async (event) => {
    event.preventDefault();
    setCommentError("");

    try {
      await api.post(`/tickets/${id}/comments`, {
        content: commentForm.content,
        isInternal: false,
      });
      setCommentForm({ content: "" });
      await loadComments();
    } catch (err) {
      setCommentError("Impossible d'ajouter le commentaire.");
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (commentId) => {
    try {
      await api.put(`/tickets/${id}/comments/${commentId}`, { content: editContent });
      setEditingId(null);
      setEditContent("");
      await loadComments();
    } catch (err) {
      setCommentError("Impossible de modifier le commentaire.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-10 bg-white">
        <div className="max-w-4xl mx-auto text-sm text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen px-4 py-10 bg-white">
        <div className="max-w-4xl mx-auto text-sm text-red-500">{error || "Ticket introuvable."}</div>
        <div className="max-w-4xl mx-auto mt-4">
          <Button asChild variant="outline">
            <Link to="/user">Retour</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 pb-5 border-b md:flex-row md:items-center md:justify-between border-slate-200">
          <div>
            <Button asChild variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link to="/user">Retour mes tickets</Link>
            </Button>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Ticket {ticket.ticketNumber || `#${ticket.id}`}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{ticket.title}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Details du ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Description</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {ticket.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500">Priorite</span>
                  <div className="font-semibold text-slate-800">{ticket.priority}</div>
                </div>
                <div>
                  <span className="block text-slate-500">Categorie</span>
                  <div className="font-semibold text-slate-800">{ticket.category}</div>
                </div>
                <div>
                  <span className="block text-slate-500">Cree le</span>
                  <div className="font-semibold text-slate-800">{formatDate(ticket.createdAt)}</div>
                </div>
                <div>
                  <span className="block text-slate-500">Mis a jour</span>
                  <div className="font-semibold text-slate-800">{formatDate(ticket.updatedAt)}</div>
                </div>
              </div>
              {ticket.resolution && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Resolution</h3>
                  <p className="mt-2 text-sm text-slate-700">{ticket.resolution}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Ajouter un commentaire</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddComment} className="space-y-4">
                <Textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  placeholder="Ecrivez votre commentaire..."
                  required
                  rows={4}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
                {commentError && (
                  <p className="text-sm text-red-500">{commentError}</p>
                )}
                <Button type="submit" className="w-full font-semibold text-white bg-cyan-600 hover:bg-cyan-500">
                  Ajouter le commentaire
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Commentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-slate-500">Aucun commentaire pour le moment.</p>
            )}

            {comments.map((comment) => (
              <div key={comment.id} className="p-4 border rounded-xl border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-800">
                    {comment.authorFullName || comment.authorUsername}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant={comment.isInternal ? "secondary" : "outline"}>
                      {comment.isInternal ? "Interne" : "Public"}
                    </Badge>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
                {editingId === comment.id ? (
                  <div className="mt-3 space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="bg-white border-slate-200 text-slate-900"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => saveEdit(comment.id)}>
                        Enregistrer
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
                )}
                {comment.edited && (
                  <p className="mt-1 text-xs text-slate-400">
                    Modifie le {formatDate(comment.editedAt)}
                  </p>
                )}
                {currentUser && currentUser.id === comment.authorId && editingId !== comment.id && (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" onClick={() => startEdit(comment)}>
                      Modifier
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
