import React, { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  Folder, 
  Plus, 
  Image, 
  Video, 
  FileText, 
  Code,
  Moon,
  Sun,
  Tag,
  X,
  PlayCircle 
} from 'lucide-react';

const IPCSHost = () => {
  const [files, setFiles] = useState([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Types de contenu supportés
  const contentTypes = [
    { 
      type: 'image', 
      icon: <Image className="w-12 h-12 text-blue-500" />,
      acceptedFormats: 'image/*',
      description: 'Sélectionnez uniquement des fichiers image (jpg, png, gif, etc.)'
    },
    { 
      type: 'video', 
      icon: <Video className="w-12 h-12 text-green-500" />,
      acceptedFormats: 'video/*',
      description: 'Sélectionnez uniquement des fichiers vidéo (mp4, avi, mov, etc.)'
    },
    { 
      type: 'texte', 
      icon: <FileText className="w-12 h-12 text-purple-500" />,
      acceptedFormats: '.txt,.md,.pdf',
      description: 'Écrivez votre texte ou téléchargez un fichier texte'
    },
    { 
      type: 'fichier', 
      icon: <File className="w-12 h-12 text-red-500" />,
      acceptedFormats: '*',
      description: 'Téléchargez n\'importe quel type de fichier'
    }
  ];

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && documentTitle.trim()) {
      const newFile = {
        id: Date.now(),
        title: documentTitle,
        name: uploadedFile.name,
        type: selectedContentType,
        size: `${(uploadedFile.size / 1024).toFixed(2)} Ko`,
        uploadDate: new Date().toLocaleDateString(),
        file: uploadedFile,
        fileUrl: URL.createObjectURL(uploadedFile),
        previewUrl: selectedContentType === 'image' ? URL.createObjectURL(uploadedFile) : null
      };
      setFiles([...files, newFile]);
      setIsCreationModalOpen(false);
      setDocumentTitle('');
      setSelectedContentType(null);
    }
  };

  const handleTextSubmit = () => {
    if (textContent.trim() && documentTitle.trim()) {
      const newFile = {
        id: Date.now(),
        title: documentTitle,
        name: 'Texte',
        type: 'texte',
        size: `${textContent.length} caractères`,
        uploadDate: new Date().toLocaleDateString(),
        content: textContent
      };
      setFiles([...files, newFile]);
      setTextContent('');
      setDocumentTitle('');
      setIsCreationModalOpen(false);
      setSelectedContentType(null);
    }
  };

  const handleFileView = (file) => {
    setSelectedFile(file);
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-gray-900 bg-opacity-90' : 'bg-black bg-opacity-70'}`}>
        <div className={`w-3/4 max-w-4xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 relative shadow-2xl`}>
          <button 
            onClick={() => setSelectedFile(null)}
            className={`absolute top-4 right-4 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-100'} p-2 rounded-full transition`}
          >
            <X />
          </button>

          <h2 className="text-2xl font-bold mb-4 flex items-center">
            {selectedFile.type === 'image' && <Image className="mr-2 text-blue-500" />}
            {selectedFile.type === 'video' && <Video className="mr-2 text-green-500" />}
            {selectedFile.type === 'texte' && <FileText className="mr-2 text-purple-500" />}
            {selectedFile.title}
          </h2>

          {selectedFile.type === 'image' && (
            <img 
              src={selectedFile.previewUrl} 
              alt={selectedFile.name} 
              className="max-w-full max-h-[70vh] mx-auto object-contain rounded-lg shadow-md"
            />
          )}

          {selectedFile.type === 'video' && (
            <div className="video-container">
              <video 
                ref={videoRef}
                controls 
                className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-md"
                src={selectedFile.fileUrl}
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          )}

          {selectedFile.type === 'texte' && (
            <pre className={`overflow-auto p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg max-h-[70vh]`}>
              {selectedFile.content || 'Contenu du fichier'}
            </pre>
          )}
        </div>
      </div>
    );
  };

  const renderCreationModal = () => (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ${isCreationModalOpen ? 'block' : 'hidden'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl p-6 w-[500px] shadow-2xl`}>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Tag className="mr-2 text-blue-500" /> Créer un nouveau contenu
        </h2>
        
        {/* Titre du document */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Titre du document</label>
          <input 
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Saisissez un titre pour votre document"
            className={`w-full p-3 border-2 rounded-lg focus:ring-2 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 focus:ring-blue-500' 
                : 'bg-white border-gray-300 focus:border-blue-500'
            }`}
          />
        </div>
        
        {!selectedContentType && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {contentTypes.map((contentType) => (
              <button
                key={contentType.type}
                onClick={() => setSelectedContentType(contentType.type)}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition duration-300 group ${
                  isDarkMode 
                    ? 'border-gray-600 hover:bg-gray-700 hover:border-blue-500' 
                    : 'border-gray-300 hover:bg-gray-100 hover:border-blue-500'
                } ${!documentTitle ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!documentTitle}
              >
                {contentType.icon}
                <span className="mt-2 capitalize group-hover:text-blue-500">{contentType.type}</span>
              </button>
            ))}
          </div>
        )}

        {selectedContentType === 'texte' && (
          <div>
            <p className="mb-2 text-sm text-gray-500">{contentTypes.find(ct => ct.type === 'texte').description}</p>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Saisissez votre texte ici..."
              className={`w-full h-40 p-3 border-2 rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            />
            <div className="flex justify-between mt-4">
              <button 
                onClick={handleTextSubmit}
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${isDarkMode ? 'hover:bg-blue-600' : 'hover:bg-blue-600'}`}
                disabled={!textContent.trim()}
              >
                Enregistrer
              </button>
              <button 
                onClick={() => {
                  setSelectedContentType(null);
                  setTextContent('');
                }}
                className={`${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded-lg`}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {(selectedContentType === 'image' || selectedContentType === 'video' || selectedContentType === 'fichier') && (
          <div>
            <p className="mb-2 text-sm text-gray-500">
              {contentTypes.find(ct => ct.type === selectedContentType).description}
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={contentTypes.find(ct => ct.type === selectedContentType)?.acceptedFormats}
              className={`w-full p-3 border-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => setSelectedContentType(null)}
                className={`${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded-lg`}
              >
                Retour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100'} p-8`}>
      <div className="container mx-auto max-w-6xl">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              IPCS'host
            </h1>
            <span className="ml-4 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Bêta</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition duration-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {isDarkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-700" />}
            </button>
            <button 
              onClick={() => setIsCreationModalOpen(true)}
              className={`text-white px-4 py-2 rounded-full flex items-center transition duration-300 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}
            >
              <Plus className="mr-2" /> Créer
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {files.map((file) => (
            <div 
              key={file.id} 
              onClick={() => handleFileView(file)}
              className={`cursor-pointer rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl group ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                  : 'bg-white hover:bg-gray-50 border'
              }`}
            >
              <div className="p-4 flex items-center">
                {file.type === 'image' && <Image className="mr-4 text-blue-500 group-hover:text-blue-600" />}
                {file.type === 'video' && <Video className="mr-4 text-green-500 group-hover:text-green-600" />}
                {file.type === 'texte' && <FileText className="mr-4 text-purple-500 group-hover:text-purple-600" />}
                {file.type === 'fichier' && <File className="mr-4 text-red-500 group-hover:text-red-600" />}
                
                <div>
                  <p className="font-bold text-lg mb-1 group-hover:text-blue-600">{file.title}</p>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {file.size} - {file.uploadDate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {renderCreationModal()}
        {renderFilePreview()}
      </div>
    </div>
  );
};

export default IPCSHost;
