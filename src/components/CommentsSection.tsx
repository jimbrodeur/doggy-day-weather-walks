
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, User } from 'lucide-react';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
}

interface CommentsSectionProps {
  zipCode: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ zipCode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!zipCode) return;

    fetchComments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('Comment update:', payload);
          fetchComments(); // Refresh comments on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [zipCode]);

  const fetchComments = async () => {
    try {
      // Get comments from users in the same zip code area
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          comment,
          created_at,
          user_id,
          user_table!inner(zip_code)
        `)
        .eq('user_table.zip_code', zipCode)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(commentsData || []);
    } catch (error) {
      console.error('Error in fetchComments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      // First, ensure user exists in user_table with current zip code
      const { data: existingUser } = await supabase
        .from('user_table')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!existingUser) {
        // Create user entry if doesn't exist
        await supabase
          .from('user_table')
          .insert({ 
            user_id: user.id, 
            zip_code: zipCode 
          });
      } else {
        // Update zip code for existing user
        await supabase
          .from('user_table')
          .update({ zip_code: zipCode })
          .eq('user_id', user.id);
      }

      // Insert comment
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          comment: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      // Comments will update automatically via realtime
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!zipCode) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">
          Local Walking Conditions ({zipCode})
        </h3>
      </div>

      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <Textarea
            placeholder="Share current walking conditions in your area..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3"
            rows={3}
          />
          <Button 
            type="submit" 
            disabled={loading || !newComment.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Posting...' : 'Share Update'}
          </Button>
        </form>
      )}

      {!user && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm">
            Sign in to share walking conditions with other dog owners in your area!
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No recent updates from your area. Be the first to share!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-800 text-sm">{comment.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(comment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Comments are visible for 24 hours and shared with users in your zip code area.
      </div>
    </div>
  );
};
