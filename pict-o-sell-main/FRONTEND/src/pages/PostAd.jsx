import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiPlusCircle, FiX } from 'react-icons/fi';
import axios from 'axios';

function PostAd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
        navigate('/login')
    }
  }, [navigate])

  // Improved file upload handler with better error handling
  const handleImageUpload = (e) => {
    try {
      const file = e.target.files[0];
      
      // Make sure a file was selected
      if (!file) {
        console.log('No file selected');
        return;
      }
      
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload JPG or PNG.');
        return;
      }

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImage(file);
        console.log('Image preview created and image state set');
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      alert('An error occurred while processing the image. Please try again.');
    }
  };

  // Direct trigger for file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!title || !price || !category || !description || !image) {
      alert('Please fill in all fields and upload an image');
      return;
    }

    try {
      setLoading(true);
      const formdata = new FormData();
      formdata.append('title', title);
      formdata.append('price', price);
      formdata.append('category', category);
      formdata.append('description', description);
      formdata.append('image', image);

      const url = 'http://localhost:3000/postAd';

      const response = await axios.post(url, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.message) {
        alert(response.data.message);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'An error occurred while posting the ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="p-8 md:p-12">
            <div className="flex items-center mb-10">
              <FiPlusCircle className="text-4xl text-purple-600 dark:text-purple-400 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Post a New Ad</h1>
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
                      border border-gray-300 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
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
                      border border-gray-300 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
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
                    border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                  "
                  required
                >
                  <option value="">Select a category</option>
                  <option value="books">Books</option>
                  <option value="electronics">Electronics</option>
                  <option value="hostel">Hostel Items</option>
                  <option value="sports">Sports</option>
                  <option value="music">Music</option>
                  <option value="others">Others</option>
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
                    border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                  "
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                {/* Changed to a button approach with the upload area being fully clickable */}
                <div 
                  onClick={triggerFileInput}
                  className="
                    mt-2 flex justify-center px-6 py-8 
                    border-2 border-dashed border-gray-300 
                    rounded-lg hover:border-purple-500 
                    transition-all duration-300
                    cursor-pointer
                  "
                >
                  <div className="text-center w-full">
                    {imagePreview ? (
                      <div className="relative mx-auto mb-4 max-w-xs">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto h-48 w-auto object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            handleRemoveImage();
                          }}
                          className="
                            absolute top-0 right-0 
                            bg-red-500 text-white 
                            rounded-full p-1 
                            hover:bg-red-600 
                            transition-colors
                          "
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300 mb-4" />
                    )}
                    
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="
                        relative
                        bg-white rounded-md font-medium 
                        text-purple-600 hover:text-purple-500 
                        px-3 py-2
                      ">
                        {imagePreview ? 'Change Image' : 'Upload an image'}
                      </span>
                      
                      {/* File input is still here but completely hidden */}
                      <input
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="
                    w-full py-3 px-4 
                    bg-purple-600 text-white 
                    rounded-lg hover:bg-purple-700 
                    transition-colors duration-300 
                    flex items-center justify-center 
                    space-x-2 font-semibold
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
                      <FiPlusCircle />
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