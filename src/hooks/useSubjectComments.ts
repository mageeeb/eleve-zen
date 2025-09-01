import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/Student';

export interface SubjectComment {
  id: string;
  contenu: string;
  matiere: string;
  eleve_id: string;
  created_at: string;
}

export const useSubjectComments = (studentId: string) => {
  const [comments, setComments] = useState<SubjectComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commentaires')
        .select('*')
        .eq('eleve_id', studentId)
        .not('matiere', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching subject comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (subject: Subject, content: string) => {
    try {
      const { data, error } = await supabase
        .from('commentaires')
        .insert({
          eleve_id: studentId,
          matiere: subject,
          contenu: content
        })
        .select()
        .single();

      if (error) throw error;
      
      setComments(prev => [data, ...prev]);
      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('commentaires')
        .update({ contenu: content })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? data : comment
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating comment:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('commentaires')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
  };

  const getCommentsBySubject = (subject: Subject) => {
    return comments.filter(comment => comment.matiere === subject);
  };

  useEffect(() => {
    if (studentId) {
      fetchComments();
    }
  }, [studentId]);

  return {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment,
    getCommentsBySubject,
    refetch: fetchComments
  };
};