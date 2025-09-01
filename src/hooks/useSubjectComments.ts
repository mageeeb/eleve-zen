import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/Student';

export interface SubjectComment {
  id: string;
  contenu: string;
  matiere: string;
  eleve_id: string;
  created_at: string;
  created_by?: string;
  user_name?: string;
  user_avatar?: string;
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

      // Fetch user profiles for each comment
      const commentsWithUserInfo = await Promise.all(
        (data || []).map(async (comment) => {
          if (comment.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url, email')
              .eq('id', comment.created_by)
              .single();

            return {
              ...comment,
              user_name: profile?.display_name || profile?.email || 'Utilisateur inconnu',
              user_avatar: profile?.avatar_url
            };
          }
          return {
            ...comment,
            user_name: 'Utilisateur inconnu',
            user_avatar: null
          };
        })
      );

      setComments(commentsWithUserInfo);
    } catch (error) {
      console.error('Error fetching subject comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (subject: Subject, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('commentaires')
        .insert({
          contenu: content,
          matiere: subject as string,
          eleve_id: studentId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add user info to the new comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, email')
        .eq('id', user?.id)
        .single();

      const commentWithUserInfo = {
        ...data,
        user_name: profile?.display_name || profile?.email || 'Utilisateur inconnu',
        user_avatar: profile?.avatar_url
      };
      
      setComments(prev => [commentWithUserInfo, ...prev]);
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