'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Settings,
  Save,
  Trophy,
  Plus,
  Minus,
  Info,
  Image,
  Camera,
  Video,
} from 'lucide-react';

interface ContestForm {
  title: string;
  description: string;
  type: 'art' | 'photography' | 'video';
  startDate: string;
  endDate: string;
  resultsDate: string;
  acceptedFormats: string[];
  maxFileSize: number;
  maxSubmissionsPerUser: number;
  rules: string;
  prizes: Array<{
    position: number;
    title: string;
    description: string;
  }>;
  showPrizes: boolean;
}

const contestTypes = [
  {
    id: 'art',
    label: 'Art/Design',
    icon: Image,
    description: 'Digital art, drawings, paintings, designs',
    defaultFormats: ['jpg', 'png', 'gif', 'svg'],
  },
  {
    id: 'photography',
    label: 'Photography',
    icon: Camera,
    description: 'Photos, portraits, landscapes, creative shots',
    defaultFormats: ['jpg', 'png', 'raw', 'tiff'],
  },
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    description: 'Short films, animations, documentaries',
    defaultFormats: ['mp4', 'mov', 'avi', 'mkv'],
  },
];

export default function CreateCreativeContest() {
  const { data: session } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ContestForm>({
    title: '',
    description: '',
    type: 'art',
    startDate: '',
    endDate: '',
    resultsDate: '',
    acceptedFormats: ['jpg', 'png', 'gif'],
    maxFileSize: 25,
    maxSubmissionsPerUser: 3,
    rules: '',
    prizes: [
      { position: 1, title: 'First Place', description: 'Winner' },
      { position: 2, title: 'Second Place', description: 'Runner-up' },
      { position: 3, title: 'Third Place', description: 'Third place' },
    ],
    showPrizes: true,
  });

  const steps = [
    { id: 1, title: 'Basic Information', icon: Info },
    { id: 2, title: 'Timeline & Rules', icon: Calendar },
    { id: 3, title: 'Prizes & Settings', icon: Trophy },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim())
          newErrors.description = 'Description is required';
        if (!formData.type) newErrors.type = 'Contest type is required';
        break;
      case 2:
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.resultsDate)
          newErrors.resultsDate = 'Results date is required';
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (new Date(formData.resultsDate) <= new Date(formData.endDate)) {
          newErrors.resultsDate = 'Results date must be after end date';
        }
        if (!formData.rules.trim()) newErrors.rules = 'Rules are required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleTypeChange = (type: 'art' | 'photography' | 'video') => {
    const selectedType = contestTypes.find((t) => t.id === type);
    setFormData((prev) => ({
      ...prev,
      type,
      acceptedFormats: selectedType?.defaultFormats || [],
    }));
  };

  const addPrize = () => {
    setFormData((prev) => ({
      ...prev,
      prizes: [
        ...prev.prizes,
        {
          position: prev.prizes.length + 1,
          title: '',
          description: '',
        },
      ],
    }));
  };

  const removePrize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (asDraft = false) => {
    if (!validateStep(currentStep)) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/creative-contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: asDraft ? 'draft' : 'active',
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/creative-contests/${data.contest._id}`);
      } else {
        setErrors({ submit: data.error || 'Failed to create contest' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create contest' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Create Creative Contest
          </h1>
          <p className="text-gray-400 mt-2">
            Set up a new art, photography, or video competition
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-600 bg-gray-800 text-gray-400'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-blue-400'
                          : isCompleted
                            ? 'text-green-400'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-gray-800 rounded-lg p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contest Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter contest title..."
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Describe the contest, its goals, and any special instructions..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Contest Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contestTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.type === type.id;

                    return (
                      <div
                        key={type.id}
                        onClick={() => handleTypeChange(type.id as any)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Icon
                            className={`mr-3 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`}
                            size={24}
                          />
                          <h3
                            className={`font-medium ${isSelected ? 'text-blue-300' : 'text-white'}`}
                          >
                            {type.label}
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {type.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {errors.type && (
                  <p className="text-red-400 text-sm mt-1">{errors.type}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Timeline & Rules */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Timeline & Rules
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.startDate && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.endDate && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Results Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.resultsDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        resultsDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.resultsDate && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.resultsDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxFileSize}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxFileSize: parseInt(e.target.value) || 25,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Submissions per User
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxSubmissionsPerUser}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxSubmissionsPerUser: parseInt(e.target.value) || 3,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accepted File Formats
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {contestTypes
                    .find((t) => t.id === formData.type)
                    ?.defaultFormats.map((format) => (
                      <label key={format} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.acceptedFormats.includes(format)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                acceptedFormats: [
                                  ...prev.acceptedFormats,
                                  format,
                                ],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                acceptedFormats: prev.acceptedFormats.filter(
                                  (f) => f !== format
                                ),
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-gray-300 uppercase">
                          {format}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contest Rules & Guidelines *
                </label>
                <textarea
                  value={formData.rules}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rules: e.target.value }))
                  }
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="• Must be original work&#10;• No copyrighted material&#10;• Appropriate content only&#10;• etc..."
                />
                {errors.rules && (
                  <p className="text-red-400 text-sm mt-1">{errors.rules}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Prizes & Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Prizes & Settings
              </h2>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Prizes</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.showPrizes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          showPrizes: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-300">
                      Show prizes to participants
                    </span>
                  </label>
                </div>

                <div className="space-y-3">
                  {formData.prizes.map((prize, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
                    >
                      <input
                        type="text"
                        value={prize.title}
                        onChange={(e) => {
                          const newPrizes = [...formData.prizes];
                          newPrizes[index] = {
                            ...newPrizes[index],
                            title: e.target.value,
                          };
                          setFormData((prev) => ({
                            ...prev,
                            prizes: newPrizes,
                          }));
                        }}
                        placeholder="Prize title"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={prize.description}
                        onChange={(e) => {
                          const newPrizes = [...formData.prizes];
                          newPrizes[index] = {
                            ...newPrizes[index],
                            description: e.target.value,
                          };
                          setFormData((prev) => ({
                            ...prev,
                            prizes: newPrizes,
                          }));
                        }}
                        placeholder="Description"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removePrize(index)}
                        className="text-red-400 hover:text-red-300 p-2 rounded transition-colors"
                      >
                        <Minus size={16} />
                        <span className="ml-1">Remove</span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPrize}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Prize</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep === steps.length && (
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save as Draft'}</span>
                </button>
              )}

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Trophy size={16} />
                  <span>{saving ? 'Creating...' : 'Create & Publish'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-300">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
