import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText,
  Moon,
  Sun,
  Tag,
  X,
  Download,
  Plus,
  Search,
  Trash2,
  Grid,
  List,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];

const IPCSHost = () => {
  const [files, setFiles] = useState([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const fileInputRef = useRef(null);

  const contentTypes = [
    { 
      type: 'image', 
      icon: <Image className="w-12 h-12 text-blue-500" />,
      acceptedFormats: ALLOWED_IMAGE_TYPES.join(','),
      description: 'Images (jpg, png, gif, webp)',
      maxSize: '10MB'
    },
    { 
      type: 'video', 
      icon: <Video className="w-12 h-12 text-green-500" />,
      acceptedFormats: ALLOWED_VIDEO_TYPES.join(','),
      description: 'Vidéos (mp4, webm, avi)',
      maxSize: '50MB'
    },
    { 
      type: 'texte', 
      icon: <FileText className="w-12 h-12 text-purple-500" />,
      acceptedFormats: '.txt,.md,.pdf',
      description: 'Documents texte',
      maxSize: '5MB'
    },
    { 
      type: 'fichier', 
      icon: <File className="w-12 h-12 text-red-500" />,
      acceptedFormats: '*',
      description: 'Tous types de fichiers',
      maxSize: '50MB'
    }
  ];

  const validateFile = (file, type) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Le fichier est trop volumineux. Taille maximum : ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (type === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Format d\'image non supporté');
    }

    if (type === 'video' && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error('Format vidéo non supporté');
    }
  };

  const handleFileUpload = async (event) => {
    try {
      setLoading(true);
      setError(null);
      const uploadedFile = event.target.files[0];

      if (!uploadedFile || !documentTitle.trim()) {
        throw new Error('Veuillez sélectionner un fichier et saisir un titre');
      }

      validateFile(uploadedFile, selectedContentType);

      const newFile = {
        id: Date.now(),
        title: documentTitle.trim(),
        name: uploadedFile.name,
        type: selectedContentType,
        size: `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        file: uploadedFile,
        fileUrl: URL.createObjectURL(uploadedFile),
        previewUrl: selectedContentType === 'image' ? URL.createObjectURL(uploadedFile) : null,
        tags: []
      };

      setFiles(prev => [...prev, newFile]);
      setIsCreationModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = useCallback(() => {
    try {
      setError(null);
      if (!textContent.trim() || !documentTitle.trim()) {
        throw new Error('Veuillez saisir un titre et du contenu');
      }

      const blob = new Blob([textContent], { type: 'text/plain' });
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('Le texte est trop long (max 5MB)');
      }

      const newFile = {
        id: Date.now(),
        title: documentTitle.trim(),
        name: `${documentTitle.trim()}.txt`,
        type: 'texte',
        size: `${(blob.size / 1024).toFixed(2)} KB`,
        uploadDate: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        content: textContent,
        file: blob,
        fileUrl: URL.createObjectURL(blob),
        tags: []
      };

      setFiles(prev => [...prev, newFile]);
      resetForm();
      setIsCreationModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }, [textContent, documentTitle]);

  const resetForm = () => {
    setTextContent('');
    setDocumentTitle('');
    setSelectedContentType(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  }, [selectedFile]);

  const handleDownload = useCallback((file) => {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const filteredAndSortedFiles = files
    .filter(file => {
      const searchLower = searchQuery.toLowerCase();
      return (
        file.title.toLowerCase().includes(searchLower) ||
        file.name.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'name':
          return order * a.title.localeCompare(b.title);
        case 'size':
          return order * (parseFloat(a.size) - parseFloat(b.size));
        case 'type':
          return order * a.type.localeCompare(b.type);
        default:
          return order * (a.timestamp - b.timestamp);
      }
    });

  const ErrorAlert = ({ message }) => (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );

  const FilePreview = () => {
    if (!selectedFile) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <div className="w-4/5 max-w-5xl bg-gray-900 rounded-2xl p-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {selectedFile.title}
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={() => handleDownload(selectedFile)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-colors"
              >
                <Download size={20} />
                Télécharger
              </button>
              <button 
                onClick={() => handleDelete(selectedFile.id)}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            {selectedFile.type === 'image' && (
              <img 
                src={selectedFile.previewUrl} 
                alt={selectedFile.name} 
                className="max-w-full max-h-[70vh] mx-auto object-contain rounded-lg"
              />
            )}
            {selectedFile.type === 'video' && (
              <video 
                controls 
                className="max-w-full max-h-[70vh] mx-auto rounded-lg"
                src={selectedFile.fileUrl}
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            )}
            {selectedFile.type === 'texte' && (
              <pre className="overflow-auto p-6 bg-gray-700 rounded-lg max-h-[70vh] text-gray-100 font-mono">
                {selectedFile.content}
              </pre>
            )}
          </div>

          <div className="mt-4 text-gray-400 text-sm">
            <p>Taille: {selectedFile.size}</p>
            <p>Uploadé le: {selectedFile.uploadDate}</p>
          </div>
        </div>
      </div>
    );
  };

  const CreationModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isCreationModalOpen ? '' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-90" onClick={() => setIsCreationModalOpen(false)} />
      <div className="relative bg-gray-900 rounded-2xl p-8 w-[600px] max-w-[90vw]">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Tag className="text-blue-500" />
          Nouveau contenu
        </h2>
        
        {error && <ErrorAlert message={error} />}

        <div className="space-y-6">
          <input 
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Titre du document"
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {!selectedContentType ? (
            <div className="grid grid-cols-2 gap-4">
              {contentTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedContentType(type.type)}
                  className="flex flex-col items-center p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition duration-300"
                  disabled={!documentTitle}
                >
                  {type.icon}
                  <span className="mt-3 text-white capitalize">{type.type}</span>
                  <span className="mt-1 text-gray-400 text-sm">Max: {type.maxSize}</span>
                </button>
              ))}
            </div>
          ) : selectedContentType === 'texte' ? (
            <div className="space-y-4">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Saisissez votre texte ici..."
                className="w-full h-48 p-4 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none"
              />
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedContentType(null)}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Retour
                </button>
                <button 
                  onClick={handleTextSubmit}
                  disabled={loading || !textContent.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Publier
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept={contentTypes.find(ct => ct.type === selectedContentType)?.acceptedFormats}
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white"
              />
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedContentType(null)}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              IPCS'host
            </h1>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
              Bêta
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 bg-gray-800/50 rounded-xl hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-gray-300" />}
              </button>

              <button
                onClick={() => setIsCreationModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/20"
              >
                <Plus size={20} />
                Créer
              </button>
            </div>
          </div>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="size">Taille</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {filteredAndSortedFiles.length > 0 && (
            <p className="text-gray-400">
              {filteredAndSortedFiles.length} fichier{filteredAndSortedFiles.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">Aucun fichier</h3>
            <p className="text-gray-400 mb-6">Commencez par créer ou uploader un fichier</p>
            <button
              onClick={() => setIsCreationModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Créer
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
            'flex flex-col gap-4'
          }>
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`group cursor-pointer bg-gray-800/50 backdrop-blur-sm ${
                  viewMode === 'grid' 
                    ? 'rounded-xl p-6 border border-gray-700 hover:border-blue-500' 
                    : 'rounded-xl p-4 border border-gray-700 hover:border-blue-500'
                } transition duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
              >
                <div className={`flex items-start ${viewMode === 'grid' ? 'flex-col gap-4' : 'gap-4'}`}>
                  <div className={`${viewMode === 'grid' ? 'w-full' : 'flex-shrink-0'}`}>
                    {file.type === 'image' && <Image className="text-blue-500 h-8 w-8" />}
                    {file.type === 'video' && <Video className="text-green-500 h-8 w-8" />}
                    {file.type === 'texte' && <FileText className="text-purple-500 h-8 w-8" />}
                    {file.type === 'fichier' && <File className="text-red-500 h-8 w-8" />}
                  </div>

                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-semibold truncate group-hover:text-blue-400 transition">
                      {file.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 truncate">{file.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-gray-500 text-xs">{file.size}</p>
                      <p className="text-gray-500 text-xs">{file.uploadDate}</p>
                    </div>
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Download size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreationModal />
      <FilePreview />
    </div>
  );
};

export default IPCSHost;
