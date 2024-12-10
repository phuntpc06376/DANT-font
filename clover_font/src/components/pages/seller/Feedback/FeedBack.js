import React, { useState, useEffect } from 'react';
import { getEvaluateFeedback, createEvaluateFeedback, updateEvaluateFeedback, deleteEvaluateFeedback } from '../api/feedBackApi';

const EvaluateFeedbackManager = ({ evaluateId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackList = await getEvaluateFeedback(evaluateId);
        setFeedbacks(feedbackList || []);
      } catch (err) {
        setError('Không thể tải danh sách phản hồi.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [evaluateId]);

  const handleCreateFeedback = async () => {
    if (!newFeedback) {
      setError('Vui lòng nhập nội dung phản hồi.');
      return;
    }
    const params = {
      content: newFeedback,
      evaluate: evaluateId,
    };
    try {
      await createEvaluateFeedback(params, image);
      setNewFeedback('');
      setImage(null);
      setError(null);
      setLoading(true);
      const feedbackList = await getEvaluateFeedback(evaluateId);
      setFeedbacks(feedbackList || []);
    } catch (err) {
      setError('Lỗi khi tạo phản hồi.');
    }
  };

  const handleUpdateFeedback = async (id, updatedContent) => {
    const params = {
      id,
      content: updatedContent,
      evaluate: evaluateId,
    };
    try {
      await updateEvaluateFeedback(params, image);
      setLoading(true);
      const feedbackList = await getEvaluateFeedback(evaluateId);
      setFeedbacks(feedbackList || []);
    } catch (err) {
      setError('Lỗi khi cập nhật phản hồi.');
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await deleteEvaluateFeedback(id);
      setLoading(true);
      const feedbackList = await getEvaluateFeedback(evaluateId);
      setFeedbacks(feedbackList || []);
    } catch (err) {
      setError('Lỗi khi xóa phản hồi.');
    }
  };

  if (loading) return <p>Đang tải phản hồi...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>Danh sách Phản hồi</h3>
      <ul>
        {feedbacks.map(feedback => (
          <li key={feedback.id}>
            <p>{feedback.content}</p>
            <button onClick={() => handleUpdateFeedback(feedback.id, 'Nội dung mới')}>Cập nhật</button>
            <button onClick={() => handleDeleteFeedback(feedback.id)}>Xóa</button>
          </li>
        ))}
      </ul>

      <div>
        <textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Nhập phản hồi mới"
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          accept="image/*"
        />
        <button onClick={handleCreateFeedback}>Gửi phản hồi</button>
      </div>
    </div>
  );
};

export default EvaluateFeedbackManager;
