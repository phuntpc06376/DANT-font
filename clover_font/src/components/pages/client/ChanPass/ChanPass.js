import React, { useState } from "react"; // Import React và useState từ React
import axios from "axios"; // Import axios để gửi request HTTP
import { useNavigate } from "react-router-dom"; // Import useNavigate để chuyển hướng giữa các trang
import "./ChanPass.css"; // Import file CSS để tạo kiểu cho trang

// Component hiển thị mật khẩu với icon ẩn/hiện
const PasswordInput = ({ id, name, value, onChange, showPassword, togglePassword }) => (
  <div className="form-group"> {/* Đóng gói mỗi trường nhập mật khẩu vào một div với class "form-group" */}
    <label htmlFor={id}>{name}</label> {/* Hiển thị label với tên của trường mật khẩu */}
    <div className="password-input-container"> {/* Div chứa input mật khẩu */}
      <input
        type={showPassword ? "text" : "password"} // Nếu showPassword là true, hiển thị mật khẩu, ngược lại hiển thị dạng ẩn
        id={id} // Gắn id cho input
        name={id} // Gắn name cho input
        value={value} // Gắn giá trị cho input từ state
        onChange={onChange} // Khi có thay đổi trong input, gọi hàm handleChange
        required // Đánh dấu trường này là bắt buộc
      />
      <i
        className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} // Chuyển đổi icon mắt theo trạng thái showPassword
        onClick={togglePassword} // Khi nhấn vào icon, toggle trạng thái hiển thị mật khẩu
        style={{ cursor: "pointer", marginLeft: "10px" }} // Thêm cursor pointer và khoảng cách
      />
    </div>
  </div>
);

const ChangePassword = () => {
  const navigate = useNavigate(); // Khởi tạo useNavigate để điều hướng trang

  // Sử dụng đối tượng formData để lưu trữ tất cả thông tin trong form
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Các state để lưu lỗi, thành công, trạng thái loading, và trạng thái hiển thị mật khẩu
  const [error, setError] = useState(""); 
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Biểu thức chính quy để kiểm tra mật khẩu có đủ điều kiện
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  // Hàm xử lý khi thay đổi giá trị của bất kỳ input nào trong form
  const handleChange = (e) => {
    const { name, value } = e.target; // Lấy tên và giá trị của trường input
    setFormData(prev => ({
      ...prev, // Giữ lại các giá trị cũ
      [name]: value, // Cập nhật giá trị của trường hiện tại
    }));
  };

  // Hàm xử lý khi form được submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành động mặc định của form (nạp lại trang)

    // Kiểm tra nếu mật khẩu mới và xác nhận mật khẩu không khớp
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    // Kiểm tra nếu mật khẩu mới giống mật khẩu cũ
    if (formData.oldPassword === formData.newPassword) {
      setError("Mật khẩu mới không được giống mật khẩu cũ");
      return;
    }

    // Kiểm tra nếu mật khẩu mới không thỏa mãn yêu cầu biểu thức chính quy
    if (!passwordRegex.test(formData.newPassword)) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm một chữ cái in hoa, một chữ cái in thường và một chữ số");
      return;
    }

    setError(""); // Nếu không có lỗi, xóa thông báo lỗi

    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (!token) { // Nếu không có token, yêu cầu người dùng đăng nhập lại
      setError("Vui lòng đăng nhập lại");
      return;
    }

    // Dữ liệu gửi đi, bao gồm mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu
    const data = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirPassword: formData.confirmPassword,
    };

    setLoading(true); // Bắt đầu quá trình loading

    try {
      // Gửi yêu cầu PUT để thay đổi mật khẩu
      const response = await axios.put(
        "http://localhost:8080/account/changePass/uppass",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm header Authorization với token
          },
        }
      );

      // Kiểm tra nếu yêu cầu thành công
      if (response.status === 200) {
        setSuccess("Mật khẩu đã được thay đổi thành công");

        // Chuyển hướng về trang chính sau 1.2 giây
        setTimeout(() => {
          navigate("/index");
        }, 1200);
      } else {
        setError("Vui lòng kiểm tra lại thông tin!");
      }
    } catch (err) { // Nếu có lỗi xảy ra trong quá trình gửi yêu cầu
      setError("Vui lòng kiểm tra lại mật khẩu!");
    } finally {
      setLoading(false); // Kết thúc quá trình loading
    }
  };

  // Hàm xử lý khi người dùng bấm nút Hủy
  const handleCancel = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  // Hàm để thay đổi trạng thái hiển thị mật khẩu
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev, // Giữ lại các trạng thái cũ
      [field]: !prev[field], // Toggle trạng thái hiển thị mật khẩu của trường tương ứng
    }));
  };

  return (
    <div className="change-password-container mt-3">
      <img
        className="mx-auto d-block"
        src="https://img.upanh.tv/2024/11/20/Logo4.png" // Đường dẫn đến logo
        alt="logo"
        style={{ maxWidth: "100px" }} // Giới hạn kích thước logo
      />
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}> {/* Xử lý sự kiện submit của form */}
        {/* Sử dụng PasswordInput component cho từng trường mật khẩu */}
        <PasswordInput
          id="oldPassword"
          name="Mật khẩu cũ"
          value={formData.oldPassword}
          onChange={handleChange}
          showPassword={passwordVisibility.oldPassword}
          togglePassword={() => togglePasswordVisibility('oldPassword')}
        />
        
        <PasswordInput
          id="newPassword"
          name="Mật khẩu mới"
          value={formData.newPassword}
          onChange={handleChange}
          showPassword={passwordVisibility.newPassword}
          togglePassword={() => togglePasswordVisibility('newPassword')}
        />
        
        <PasswordInput
          id="confirmPassword"
          name="Xác nhận mật khẩu mới"
          value={formData.confirmPassword}
          onChange={handleChange}
          showPassword={passwordVisibility.confirmPassword}
          togglePassword={() => togglePasswordVisibility('confirmPassword')}
        />
        {error && <div className="error-message">{error}</div>} {/* Hiển thị thông báo lỗi nếu có */}
        {success && <div className="success-message">{success}</div>} {/* Hiển thị thông báo thành công nếu có */}
        <div className="button-container">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <i className="fa fa-spinner fa-spin" /> : "Cập nhật mật khẩu"} {/* Hiển thị spinner khi đang loading */}
          </button>
          <button type="button" className="btn btn-light" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
