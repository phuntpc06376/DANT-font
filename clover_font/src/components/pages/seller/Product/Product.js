import React, { useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import productService from "../api/productApi";
import { getAllPromotionsByShop } from "../api/promotionsApi";
import { getAllTypeProducts } from "../api/prodTypeApi";
import { getAllPropertiesValues } from "../api/propertiesValueApi";
import './Product.css';
import ReactPaginate from 'react-paginate';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
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

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Calculate filteredProducts after products or searchTerm changes
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.status === true
  );

  // Paginate filteredProducts
  const offset = currentPage * itemsPerPage;
  const currentProducts = filteredProducts.slice(offset, offset + itemsPerPage);

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
      setFormData((prev) => {
        const updatedValues = Array.isArray(value)
          ? value.map((v) => v.value)
          : checked
            ? [value]
            : [];

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

  return (
    <div className="products-container">
      <h2 className="products-header">Danh sách sản phẩm</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="products-search">
        <input
          type="text"
          placeholder="Nhập tên sản phẩm để tìm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleAddProduct}>
          <i className="bi bi-plus-circle"></i> Thêm sản phẩm
        </button>
      </div>

      {showForm ? (
        <div className="products-modal modal">
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
                  <div className="form-group">
                    <label>Tên sản phẩm</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số lượng</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Khuyến mãi</label>
                    <select
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
                  <div className="form-group">
                    <label>Loại sản phẩm</label>
                    <select
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
                  <div className="form-group">
                    <label>Loại thuộc tính</label>
                    <Select
                      isMulti
                      options={propertiesValues.map((propVa) => ({
                        label: propVa.name,
                        value: propVa.id,
                      }))}
                      value={formData.propertiesValues.map((value) => ({
                        label: propertiesValues.find((pv) => pv.id === value)?.name,
                        value: value,
                      }))}
                      onChange={(selectedOptions) => {
                        setFormData((prev) => ({
                          ...prev,
                          propertiesValues: selectedOptions
                            ? selectedOptions.map((option) => option.value)
                            : [],
                        }));
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hình ảnh</label>
                    <input
                      type="file"
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
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Khuyến mãi</th>
                <th>Loại sản phẩm</th>
                <th>Thuộc tính</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.promotion?.name || "Không"}</td>
                    <td>{product.prodType?.name || "Không"}</td>
                    <td>
                      {product.propertiesValues &&
                        product.propertiesValues.map((pv, index) => (
                          <div key={index}>{pv.name}</div>
                        ))}
                    </td>
                    <td className="products-table-actions">
                      <button
                        className="btn btn-sm btn-warning"
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
                  <td colSpan="7">Không có sản phẩm nào để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="d-flex justify-content-center mt-3">
            <ReactPaginate
              previousLabel={"Trang trước"}
              nextLabel={"Tiếp theo"}
              breakLabel={"..."} // Thêm dấu ba chấm
              pageCount={Math.ceil(filteredProducts.length / itemsPerPage)}
              
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              activeClassName={"active"}
            />

          </div>
        </div>
      )}
    </div>
  );
}