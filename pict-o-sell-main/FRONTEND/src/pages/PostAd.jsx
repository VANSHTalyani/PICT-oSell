import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiPlusCircle, FiX, FiImage } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast installed

function PostAd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mainImageIndex, setMainImageIndex] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
        navigate('/login')
    }
  }, [navigate])

  // Improved file upload handler with better error handling
  const handleImageUpload = (e) => {
    try {
      const files = Array.from(e.target.files);
      
      // Make sure files were selected
      if (files.length === 0) {
        console.log('No files selected');
        return;
      }
      
      // Validate files (size and type)
      const validFiles = files.filter(file => {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB.`);
          return false;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name} has invalid type. Please upload JPG, PNG, or WebP.`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length === 0) return;
      
      // Process valid files
      const newPreviews = [];
      const processFile = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result);
            resolve();
          };
          reader.onerror = () => {
            console.error('Error reading file');
            toast.error(`Error reading ${file.name}. Please try again.`);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      };
      
      // Process all files and update state
      Promise.all(validFiles.map(processFile)).then(() => {
        setImages(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
        
        // Set the first image as the main image if none is set yet
        if (images.length === 0 && validFiles.length > 0) {
          setImagePreview(newPreviews[0]);
        }
        
        console.log(`Added ${validFiles.length} images`);
      });
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      toast.error('An error occurred while processing the images. Please try again.');
    }
  };

  // Set a specific image as the main image
  const setAsMainImage = (index) => {
    setMainImageIndex(index);
    setImagePreview(imagePreviews[index]);
  };

  // Direct trigger for file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    
    // Update main image if needed
    if (index === mainImageIndex) {
      if (newPreviews.length > 0) {
        setMainImageIndex(0);
        setImagePreview(newPreviews[0]);
      } else {
        setMainImageIndex(-1);
        setImagePreview(null);
      }
    } else if (index < mainImageIndex) {
      // Adjust main image index if we removed an image before it
      setMainImageIndex(mainImageIndex - 1);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!title || !price || !category || !description || images.length === 0) {
      toast.error('Please fill in all fields and upload at least one image');
      return;
    }

    // Validate quantity
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      toast.error('Please enter a valid quantity (minimum 1)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formdata = new FormData();
      formdata.append('title', title);
      formdata.append('price', price);
      formdata.append('category', category);
      formdata.append('description', description);
      
      // Add all images, marking the main image
      images.forEach((image, index) => {
        formdata.append('images', image);
        if (index === mainImageIndex) {
          formdata.append('mainImageIndex', index);
        }
      });
      
      formdata.append('stock', quantityNum); // Use 'stock' to match backend model
      formdata.append('quantity', quantityNum); // Also include as quantity for compatibility

      const url = 'http://localhost:5000/api/products';

      console.log('Sending form data to server:', {
        title,
        price,
        category,
        description,
        imageCount: images.length,
        mainImageIndex,
        quantity: quantityNum,
        stock: quantityNum
      });

      const response = await axios.post(url, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        console.log('Server response:', response.data);
        toast.success(response.data.message || 'Ad posted successfully!');
        navigate('/');
      }
    } catch (err) {
      console.error('Error posting ad:', err);
      setError(err.response?.data?.message || 'An error occurred while posting the ad');
      toast.error(err.response?.data?.message || 'Failed to post ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-indigo-100 dark:border-gray-700 transition-colors duration-300">
          <div className="p-8 md:p-12">
            <div className="flex items-center mb-10">
              <FiPlusCircle className="text-4xl text-indigo-600 dark:text-indigo-400 mr-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Post a New Ad</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="
                      block w-full px-4 py-3 
                      border-2 border-indigo-100 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30
                      transition-colors duration-300
                    "
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="
                      block w-full px-4 py-3 
                      border-2 border-indigo-100 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30
                      transition-colors duration-300
                    "
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="
                    block w-full px-4 py-3 
                    border-2 border-indigo-100 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30
                    transition-colors duration-300
                  "
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Academics">Academics</option>
                  <option value="Hostel & Lifestyle">Hostel & Lifestyle</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Project & DIY">Project & DIY</option>
                  <option value="Bicycles & Vehicles">Bicycles & Vehicles</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="
                    block w-full px-4 py-3 
                    border-2 border-indigo-100 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30
                    transition-colors duration-300
                  "
                  required
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Quantity Available
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="9999"
                  value={quantity}
                  onChange={(e) => {
                    // Prevent negative values
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    setQuantity(value);
                  }}
                  className="
                    block w-full px-4 py-3 
                    border-2 border-indigo-100 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30
                    transition-colors duration-300
                  "
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the number of items available for sale
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Upload Images
                </label>
                {/* Enhanced upload area with better styling */}
                <div 
                  onClick={triggerFileInput}
                  className="
                    mt-2 flex justify-center px-6 py-8 
                    border-2 border-dashed border-indigo-200 dark:border-indigo-800
                    rounded-lg hover:border-indigo-500 dark:hover:border-indigo-600
                    bg-indigo-50/50 dark:bg-indigo-900/20
                    transition-all duration-300
                    cursor-pointer
                  "
                >
                  <div className="text-center w-full">
                    {imagePreviews.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={preview} 
                              alt="Preview" 
                              className="mx-auto h-24 w-auto object-cover rounded-lg shadow-md"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent onClick
                                handleRemoveImage(index);
                              }}
                              className="
                                absolute top-2 right-2 
                                bg-red-500 text-white 
                                rounded-full p-1.5
                                hover:bg-red-600 
                                transition-colors
                                shadow-md
                              "
                            >
                              <FiX />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAsMainImage(index)}
                              className="
                                absolute bottom-2 right-2 
                                bg-indigo-500 text-white 
                                rounded-full p-1.5
                                hover:bg-indigo-600 
                                transition-colors
                                shadow-md
                              "
                            >
                              <FiImage />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <FiUpload className="mx-auto h-12 w-12 text-indigo-400 dark:text-indigo-300 mb-4" />
                    )}
                    
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="
                        relative
                        bg-gradient-to-r from-indigo-600 to-violet-600 
                        text-white font-medium 
                        px-4 py-2 rounded-full
                        hover:from-indigo-700 hover:to-violet-700
                        transition-all duration-300 shadow-md
                      ">
                        {imagePreviews.length > 0 ? 'Upload More Images' : 'Upload Images'}
                      </span>
                      
                      {/* File input is still here but completely hidden */}
                      <input
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="
                    w-full py-3 px-4 
                    bg-gradient-to-r from-indigo-600 to-violet-600 
                    text-white 
                    rounded-lg hover:from-indigo-700 hover:to-violet-700
                    transition-all duration-300 
                    flex items-center justify-center 
                    space-x-2 font-semibold
                    shadow-md hover:shadow-lg transform hover:scale-[1.02]
                  "
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <FiPlusCircle className="w-5 h-5" />
                      <span>Post Ad</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostAd;