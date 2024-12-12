import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getDenouncePosts, countDenounce, getPostById, denouncePost} from '../api/postApi';
import { getAllDenounceByPostId } from '../api/denounceApi';
import './Post.css';
import { Modal, Button, Card, Table, Spinner } from 'react-bootstrap';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [denounceCount, setDenounceCount] = useState({});
    const [selectedPost, setSelectedPost] = useState(null); // Bài viết được chọn
    const [denounceDetails, setDenounceDetails] = useState([]); // Danh sách nội dung tố cáo
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
       fetchPostDenounce();
    }, []);

    const fetchPostDenounce = async () => {
        try{
            const data = await getDenouncePosts();
            setPosts(data);

             // Sau khi lấy danh sách bài viết, lấy số lượng tố cáo cho từng bài
            const counts = {};
            for (const post of data) {
                counts[post.id] = await fetchCountDenounce(post.id); // Lấy số lượng tố cáo
            }
            setDenounceCount(counts); 

        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài viết bị tố cáo', error);
        }
    };

    const fetchCountDenounce = async (id) => {
        try {
            const count = await countDenounce(id);
            return count;
        } catch (error) {
            console.error('Lỗi khi lấy số lượng tố cáo của bài viết', error);
            return 0; // Trả về 0 nếu có lỗi
        }
    }

    const fetchDenounceDetails = async (postId) => {
        try {
            // Lấy thông tin chi tiết bài viết
            const post = await getPostById(postId); // Lấy bài viết theo ID
            setSelectedPost(post);

            // Lấy danh sách tố cáo của bài viết
            const details = await getAllDenounceByPostId(postId);
            setDenounceDetails(details);

            // Mở modal khi lấy được chi tiết bài viết và tố cáo
            setShowModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tố cáo:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPost(null);
    };

    const handleDenouncePost = async (postId) => {
        setLoading(true);
        try {
            // Gọi API denouncePost
            const message = await denouncePost(postId);

            // Xử lý kết quả trả về từ backend
            Swal.fire({
                icon: 'success',
                title: 'Cảnh cáo thành công!',
                text: message === 'Success!' ? 'Bài viết đã bị cảnh cáo thành công.' : 'Có lỗi xảy ra khi cảnh cáo bài viết.',
            });

            // Cập nhật lại danh sách bài viết nếu cần
            fetchPostDenounce(); // Hoặc một phương thức tương tự để tải lại danh sách bài viết
        } catch (error) {
            console.error('Error when denouncing post:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể gửi yêu cầu tới server.',
            });
        }
    };

    return (
        <div className='post-container'>
            <h2 className='text-center' >Danh sách bài đăng bị tố cáo</h2>
            <table className="post-table">
                <thead className="table-primary">
                    <tr>
                        <th>Tên bài viết</th>
                        <th>Ngày đăng</th>
                        <th>Nội dung</th>
                        <th>Người đăng</th>
                        <th>Số lượng tố cáo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id}>
                            <td>{post.title}</td>
                            <td>{new Date(post.postDay).toLocaleDateString()}</td>
                            <td>{post.content}</td>
                            <td>{post.account ? post.account.fullname : 'N/A'}</td>
                            <td>{denounceCount[post.id] || "Đang tải..."}</td>
                            <td>
                                <button className="btn btn-success me-1" onClick={() => fetchDenounceDetails(post.id)} >Chi tiết</button>
                                <button className="btn btn-warning me-1" onClick={() => handleDenouncePost(post.id)} disabled={loading}>
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Cảnh cáo'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>  

             {/* Modal hiển thị chi tiết bài viết và danh sách tố cáo */}
             <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        {/* Thông tin bài viết */}
                        <div className="col-md-6">
                            <Card>
                                <Card.Body>
                                    <Card.Title className='text-center mb-3'>Thông tin bài viết</Card.Title>
                                    <Card.Text><strong>Tiêu đề:</strong> {selectedPost?.title}</Card.Text>
                                    <Card.Text><strong>Ngày đăng:</strong> {new Date(selectedPost?.postDay).toLocaleDateString()}</Card.Text>
                                    <Card.Text><strong>Nội dung:</strong> {selectedPost?.content}</Card.Text>
                                    <Card.Text><strong>Người đăng:</strong> {selectedPost?.account?.fullname || 'N/A'}</Card.Text>
                                     {/* Hiển thị hình ảnh (nếu có) */}
                                     {selectedPost?.postImages && selectedPost.postImages.length > 0 && (
                                        <div>
                                            <strong>Hình ảnh:</strong>
                                            <div className="image-gallery">
                                                {selectedPost.postImages.map((image, index) => (
                                                    <img key={index} src={`http://localhost:8080/image/${image.nameImage}`} alt={`Post Image ${index}`} className="post-image" />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </Card.Body>
                            </Card>
                        </div>

                        {/* Danh sách tố cáo */}
                        <div className="col-md-6">
                            <Card>
                                <Card.Body>
                                    <Card.Title className='text-center mb-3'>Danh sách tố cáo</Card.Title>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Nội dung tố cáo</th>
                                                <th>Ngày tố cáo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {denounceDetails.map((denounce) => (
                                                <tr key={denounce.id}>
                                                    <td>{denounce.denunciation.content}</td>
                                                    <td>{new Date(denounce.accusationDate).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default PostList;
