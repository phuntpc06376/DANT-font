import React, { useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import productService from "../api/productApi";
import { getAllPromotionsByShop } from "../api/promotionsApi";
import { getAllTypeProducts } from "../api/prodTypeApi";
import { getAllPropertiesValues } from "../api/propertiesValueApi";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(""); // "add" hoặc "edit"
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
    description: "",
    promotionId: "",
    prodTypeId: "",
    propertiesValues: [],
    images: [],
  });
  const [promotions, setPromotions] = useState([]);
  const [prodTypes, setProdTypes] = useState([]);
  const [propertiesValues, setPropertiesValues] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProductsBySeller();
        setProducts(data);
      } catch (error) {
        setError("Không thể tải danh sách sản phẩm.");
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [promoData, typeData, propertiesvalueData] = await Promise.all([
          getAllPromotionsByShop(),
          getAllTypeProducts(),
          getAllPropertiesValues()
        ]);
        setPromotions(promoData);
        setProdTypes(typeData);
        setPropertiesValues(propertiesvalueData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormType("add");
    setFormData({
      name: "",
      price: "",
      quantity: "",
      description: "",
      promotionId: "",
      prodTypeId: "",
      propertiesValues: [],
      images: [],
    });
    setShowForm(true);
  };

  const deleteProductHandler = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xoá sản phẩm này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await productService.deleteProduct(id);
        // Tải lại danh sách từ server
        const updatedProducts = await productService.getProductsBySeller();
        setProducts(updatedProducts);
        Swal.fire("Đã xóa!", "Sản phẩm đã được xóa.", "success");
      } catch (error) {
        setError("Không thể xóa sản phẩm.");
        console.error("Error deleting product:", error);
        Swal.fire("Lỗi", "Không thể xóa sản phẩm.", "error");
      }
    }
  };
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormType("edit");
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      description: product.description,
      promotionId: product.promotion?.id || "",
      prodTypeId: product.prodType?.id || "",
      propertiesValues: product.propertiesValues?.map(pv => pv.id) || [],
      images: [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formToSubmit = new FormData();
    formToSubmit.append("name", formData.name || "");
    formToSubmit.append("price", formData.price || "");
    formToSubmit.append("quantity", formData.quantity || "");
    formToSubmit.append("description", formData.description || "");
    formToSubmit.append("promotionID", formData.promotionId || "");
    formToSubmit.append("prodTypeID", formData.prodTypeId || "");
    if (Array.isArray(formData.propertiesValues)) {
      formData.propertiesValues.forEach((value) => {
        formToSubmit.append("propertiesValues", value);
      });
    }
    formData.images.forEach((image) => formToSubmit.append("file", image));

    try {
      if (formType === "add") {
        await productService.createProduct(formToSubmit);
        Swal.fire("Thành công!", "Sản phẩm đã được thêm.", "success");
      } else if (formType === "edit" && selectedProduct) {
        formToSubmit.append("id", formData.id);
        await productService.updateProduct(formToSubmit);
        Swal.fire("Thành công!", "Sản phẩm đã được cập nhật.", "success");
      }

      const updatedProducts = await productService.getProductsBySeller();
      setProducts(updatedProducts);
      setShowForm(false);
    } catch (error) {
      setError("Lỗi trong quá trình gửi dữ liệu. Vui lòng thử lại!");
      console.error("Error submitting form:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "propertiesValues") {
      // Kiểm tra nếu propertiesValues là mảng
      setFormData((prev) => {
        const updatedValues = Array.isArray(value)
          ? value.map((v) => v.value)  // Lấy giá trị từ các đối tượng trong mảng
          : checked
            ? [value]  // Nếu chưa là mảng, khởi tạo mảng với giá trị đầu tiên
            : [];  // Nếu bỏ chọn, trả về mảng rỗng

        return {
          ...prev,
          propertiesValues: updatedValues,
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };





  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.status === true,
    console.log(products.propertiesValues)
  );

  return (
    <div className="container">
      <h2 className="mb-4 text-center">Danh sách sản phẩm</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-3">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Nhập tên sản phẩm để tìm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4 text-end">
          <button className="btn btn-primary" onClick={handleAddProduct}>
            <i className="bi bi-plus-circle me-2"></i>Thêm sản phẩm
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {formType === "add" ? "Thêm Sản Phẩm" : "Cập Nhật Sản Phẩm"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowForm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {/* Các trường khác */}
                  {/* Tên sản phẩm */}
                  <div className="form-group">
                    <label>Tên sản phẩm</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* Giá */}
                  <div className="form-group">
                    <label>Giá</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* Số lượng */}
                  <div className="form-group">
                    <label>Số lượng</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* Mô tả */}
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  {/* Khuyến mãi */}
                  <div className="form-group">
                    <label>Khuyến mãi</label>
                    <select
                      className="form-control"
                      name="promotionId"
                      value={formData.promotionId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn khuyến mãi</option>
                      {promotions.map((promo) => (
                        <option key={promo.id} value={promo.id}>
                          {promo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Loại sản phẩm */}
                  <div className="form-group">
                    <label>Loại sản phẩm</label>
                    <select
                      className="form-control"
                      name="prodTypeId"
                      value={formData.prodTypeId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn loại sản phẩm</option>
                      {prodTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Loại thuộc tính */}
                  <div className="form-group">
                    <label>Loại thuộc tính</label>
                    <Select
                      isMulti
                      options={propertiesValues.map((propVa) => ({
                        label: propVa.name,
                        value: propVa.id
                      }))}
                      value={formData.propertiesValues.map((value) => ({
                        label: propertiesValues.find(pv => pv.id === value)?.name,
                        value: value
                      }))}
                      onChange={(selectedOptions) => {
                        setFormData((prev) => ({
                          ...prev,
                          propertiesValues: selectedOptions ? selectedOptions.map((option) => option.value) : []
                        }));
                      }}
                    />

                  </div>

                  {/* Các trường khác */}
                  {/* Hình ảnh */}
                  <div className="form-group">
                    <label>Hình ảnh</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    {formType === "add" ? "Thêm" : "Cập Nhật"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Khuyến mãi</th>
                <th>Loại sản phẩm</th>
                <th>Thuộc tính</th> {/* Cột thuộc tính */}
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.promotion?.name || "Không"}</td>
                    <td>{product.prodType?.name || "Không"}</td>
                    <td>
                      {product.propertiesValues && product.propertiesValues.length > 0 ? (
                        product.propertiesValues.map((pv, index) => (
                          <div key={index}>
                            {pv.name} {/* Hiển thị tên thuộc tính */}
                          </div>
                        ))
                      ) : (
                        "Không có thuộc tính"
                      )}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteProductHandler(product.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}
