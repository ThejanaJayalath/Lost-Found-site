import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type ItemType = 'Phone' | 'Laptop' | 'Purse' | 'Wallet' | 'ID Card' | 'Document' | 'Pet' | 'Bag' | 'Other';

interface ReportFoundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: any;
}

export default function ReportFoundModal({ isOpen, onClose, onSuccess, initialData }: ReportFoundModalProps) {
    const { user } = useAuth();
    const [itemType, setItemType] = useState<ItemType>('Phone');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [color, setColor] = useState(initialData?.color || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [location, setLocation] = useState(initialData?.location || 'Colombo');
    const [date, setDate] = useState(initialData?.date || '');
    const [time, setTime] = useState(initialData?.time || '');
    const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '');
    const [imei, setImei] = useState(initialData?.imei || '');
    const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '');
    const [idNumber, setIdNumber] = useState(initialData?.idNumber || '');

    useEffect(() => {
        if (initialData) {
            setItemType(initialData.type ? (initialData.type.charAt(0) + initialData.type.slice(1).toLowerCase()) as ItemType : 'Phone');
            setTitle(initialData.title || '');
            setColor(initialData.color || '');
            setDescription(initialData.description || '');
            setLocation(initialData.location || 'Colombo');
            setDate(initialData.date || '');
            setTime(initialData.time || '');
            setContactPhone(initialData.contactPhone || '');
            setImei(initialData.imei || '');
            setSerialNumber(initialData.serialNumber || '');
            setIdNumber(initialData.idNumber || '');
            setImages(initialData.images || []);
        } else {
            // Reset form
            setTitle('');
            setColor('');
            setDescription('');
            setLocation('Colombo');
            setDate('');
            setTime('');
            setContactPhone('');
            setImei('');
            setSerialNumber('');
            setIdNumber('');
            setImages([]);
            setItemType('Phone');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setImages([...images, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let userId = undefined;
            if (user?.email) {
                try {
                    const userResponse = await fetch(`http://localhost:8082/api/users/${user.email}`);
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        userId = userData.id;
                    }
                } catch (error) {
                    console.error('Error fetching user ID:', error);
                }
            }

            const payload = {
                title,
                description,
                location,
                date: date || undefined,
                time: time || undefined,
                contactPhone,
                type: itemType.toUpperCase(),
                status: 'FOUND',
                color,
                images,
                imei: itemType === 'Phone' && imei ? imei : undefined,
                serialNumber: itemType === 'Laptop' && serialNumber ? serialNumber : undefined,
                idNumber: (itemType === 'ID Card' || itemType === 'Other') && idNumber ? idNumber : undefined,
                userId: userId
            };

            if (initialData) {
                await api.put(`/posts/${initialData.id}`, payload);
            } else {
                await api.post('/posts', payload);
            }

            // Reset form
            setTitle('');
            setDescription('');
            setColor('');
            setContactPhone('');
            setDate('');
            setTime('');
            setImages([]);
            setImei('');
            setSerialNumber('');
            setIdNumber('');

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                    <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Found Item' : 'Report Found Item'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Item Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">What did you find?</label>
                        <select
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value as ItemType)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                        >
                            <option value="Phone">Phone</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Purse">Purse</option>
                            <option value="Wallet">Wallet</option>
                            <option value="ID Card">ID Card</option>
                            <option value="Document">Document</option>
                            <option value="Pet">Pet</option>
                            <option value="Bag">Bag</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="space-y-4">
                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {itemType === 'Pet' ? 'Pet Name (if known)' : 'Item Name / Brand & Model'}
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none placeholder-gray-500"
                                    placeholder="e.g. iPhone 14 Pro"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none placeholder-gray-500"
                                    placeholder="e.g. Black"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Location Found</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none placeholder-gray-500"
                                    placeholder="e.g. Colombo Fort"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Number</label>
                                <input
                                    type="tel"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none placeholder-gray-500"
                                    placeholder="e.g. 0771234567"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Date Found</label>
                                <input
                                    type="date"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none [color-scheme:dark]"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Time Found</label>
                                <input
                                    type="time"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none [color-scheme:dark]"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none h-32 placeholder-gray-500"
                                placeholder="Provide specific details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Specific Fields - OPTIONAL for Found items */}
                        {itemType === 'Phone' && (
                            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                                <label className="block text-sm font-medium text-green-400 mb-1">IMEI Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-900 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none placeholder-gray-500"
                                    placeholder="Enter IMEI if visible"
                                    value={imei}
                                    onChange={(e) => setImei(e.target.value)}
                                />
                            </div>
                        )}

                        {itemType === 'Laptop' && (
                            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                                <label className="block text-sm font-medium text-blue-400 mb-1">Serial Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-900 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder-gray-500"
                                    placeholder="Enter Serial Number if visible"
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                />
                            </div>
                        )}

                        {(itemType === 'ID Card' || itemType === 'Other') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">ID / Serial Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none placeholder-gray-500"
                                    placeholder="Any unique identifier"
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Upload Images (Max 5)</label>
                            <div className="flex flex-wrap gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                                        <img src={img} alt="Upload" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-500/10 transition-colors text-gray-500 hover:text-green-500">
                                        <Upload size={24} />
                                        <span className="text-xs mt-1">Add</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 flex justify-end gap-4 bg-gray-900 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2 text-gray-400 font-medium hover:bg-gray-800 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : (initialData ? 'Save Changes' : 'Submit Report')}
                    </button>
                </div>
            </div>
        </div>
    );
}
