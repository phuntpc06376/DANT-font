import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getAllPosts, getBrowsePosts, getDenouncePosts, browsePost, denouncePost, getPostById } from '../api/postApi';
import './Post.css';
import { Modal, Button } from 'react-bootstrap';
const PostList = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [allPosts, setAllPosts] = useState([]);
    const [browsePosts, setBrowsePosts] = useState([]);
    const [denouncePosts, setDenouncePosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(5); // Số bài đăng hiển thị trên mỗi trang
    const [selectedPost, setSelectedPost] = useState(null); // Lưu bài đăng được chọn
    const [showModal, setShowModal] = useState(false); // Trạng thái hiển thị modal
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const all = await getAllPosts();
                setAllPosts(all);
            } catch (error) {
                console.error('Lỗi khi lấy tất cả bài đăng:', error);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        const fetchBrowsePosts = async () => {
            try {
                const browse = await getBrowsePosts();
                setBrowsePosts(browse);
            } catch (error) {
                console.error('Lỗi khi lấy bài đăng chờ duyệt:', error);
            }
        };

        fetchBrowsePosts();
    }, []);

    useEffect(() => {
        const fetchDenouncePosts = async () => {
            try {
                const denounce = await getDenouncePosts();
                setDenouncePosts(denounce);
            } catch (error) {
                console.error('Lỗi khi lấy bài đăng bị tố cáo:', error);
            }
        };

        fetchDenouncePosts();
    }, []);

    const closeModal = () => {
        setShowModal(false);
        setSelectedPost(null); // Xóa dữ liệu bài đăng được chọn khi đóng modal
    };
    const handleViewDetails = async (postId) => {
        try {
            const post = await getPostById(postId);
            setSelectedPost(post);
            setShowModal(true); // Hiển thị modal
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết bài đăng:', error);
        }
    };
    const handleBrowse = async (postId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn duyệt bài viết này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, duyệt!',
            cancelButtonText: 'Không, hủy!'
        });

        if (result.isConfirmed) {
            try {
                const updatedPost = await browsePost(postId);
                setAllPosts(allPosts.map(post =>
                    post.id === postId ? updatedPost : post
                ));
                Swal.fire('Đã duyệt!', 'Bài viết đã được duyệt.', 'success');
            } catch (error) {
                console.error('Lỗi khi duyệt bài viết:', error);
            }
        }
    };

    const handleDenounce = async (postId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn cảnh cáo bài viết này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, cảnh cáo!',
            cancelButtonText: 'Không, hủy!'
        });

        if (result.isConfirmed) {
            try {
                await denouncePost(postId);
                const data = await getAllPosts();
                setAllPosts(data);
                Swal.fire('Đã cảnh cáo!', 'Bài viết đã được cảnh cáo.', 'success');
            } catch (error) {
                console.error('Lỗi khi cảnh cáo bài viết:', error);
                Swal.fire('Lỗi!', 'Không thể cảnh cáo bài viết.', 'error');
            }
        }
    };

    // Tính toán các bài đăng hiện tại dựa trên trang và số bài đăng mỗi trang
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = (activeTab === 'all' ? allPosts :
        activeTab === 'browse' ? browsePosts :
            denouncePosts).slice(indexOfFirstPost, indexOfLastPost);

    // Tổng số trang
    const totalPosts = (activeTab === 'all' ? allPosts.length :
        activeTab === 'browse' ? browsePosts.length :
            denouncePosts.length);
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    // Chuyển trang
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            
            <div className="post-container">
            <h2 className="text-center mb-4">Bài Đăng</h2>
                <div className="post-tabs">
                    <button className={`post-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => {
                        setActiveTab('all');
                        setCurrentPage(1); // Reset trang về 1 khi chuyển tab
                    }}>
                        Tất cả
                    </button>
                    <button className={`post-tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => {
                        setActiveTab('browse');
                        setCurrentPage(1); // Reset trang về 1 khi chuyển tab
                    }}>
                        Bài Đăng Chờ Duyệt
                    </button>
                    <button className={`post-tab ${activeTab === 'denounce' ? 'active' : ''}`} onClick={() => {
                        setActiveTab('denounce');
                        setCurrentPage(1); // Reset trang về 1 khi chuyển tab
                    }}>
                        Bài Đăng Bị Tố Cáo
                    </button>
                </div>
            </div>

            <table className="post-table">
                <thead className="table-primary">
                    <tr>
                        <th>Tên bài viết</th>
                        <th>Ngày đăng</th>
                        <th>Nội dung</th>
                        <th>Người đăng</th>
                        <th>Trạng thái bài đăng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPosts.map(post => (
                        <tr key={post.id}>
                            <td>{post.title}</td>
                            <td>{new Date(post.postDay).toLocaleDateString()}</td>
                            <td>{post.content}</td>
                            <td>{post.account ? post.account.fullname : 'N/A'}</td>
                            <td>{post.status ? post.status.name : 'N/A'}</td>
                            <td>
                                {post.status && post.status.id === 4 && (
                                    <button className="btn btn-success btn-sm me-2" onClick={() => handleBrowse(post.id)}>Duyệt</button>
                                )}
                                {post.status && post.status.id === 2 && (
                                    <button className="btn btn-danger btn-sm">Xóa</button>
                                )}
                                {post.status && (post.status.id === 1 || post.status.id === 3) && (
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleDenounce(post.id)}>Cảnh cáo</button>
                                )}
                                <button
                                    className="btn btn-primary btn-sm me-2"
                                    onClick={() => handleViewDetails(post.id)}
                                >
                                    Xem chi tiết
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Phân trang */}
            <div className="post-pagination">
                <button
                    className="btn btn-secondary"
                    onClick={prevPage}
                    disabled={currentPage === 1} // Vô hiệu hóa nút nếu đang ở trang đầu
                >
                    Trang trước
                </button>
                <span>Trang {currentPage} / {totalPages}</span>
                <button
                    className="btn btn-secondary"
                    onClick={nextPage}
                    disabled={currentPage === totalPages} // Vô hiệu hóa nút nếu đang ở trang cuối
                >
                    Tiếp theo
                </button>
            </div>
            {/* Modal chi tiết bài đăng */}
            {selectedPost && (
                <Modal className="post-modal" show={showModal} onHide={closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Chi tiết bài đăng</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Tên bài viết:</strong> {selectedPost.title}</p>
                        <p><strong>Ngày đăng:</strong> {new Date(selectedPost.postDay).toLocaleDateString()}</p>
                        <p><strong>Nội dung:</strong> {selectedPost.content}</p>
                        <p><strong>Người đăng:</strong> {selectedPost.account ? selectedPost.account.fullname : 'N/A'}</p>
                        <p><strong>Hình ảnh:</strong></p>
                        {selectedPost.imageUrl ? (
                            <img
                                src={selectedPost.imageUrl}
                                alt="Hình ảnh bài đăng"
                                style={{ width: '100%', height: 'auto' }}
                            />
                        ) : (
                            <p>Không có hình ảnh</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default PostList;
