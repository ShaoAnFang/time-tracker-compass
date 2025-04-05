
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { TimeEntry } from '@/types';

interface TimeEntryFormProps {
  onSuccess?: () => void;
  initialValues?: TimeEntry;
  isEditing?: boolean;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ 
  onSuccess, 
  initialValues, 
  isEditing = false 
}) => {
  const { currentUser } = useAuth();
  const { 
    mainCategories, 
    getSubCategoriesForMainCategory, 
    addTimeEntry, 
    updateTimeEntry 
  } = useData();
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [availableSubCategories, setAvailableSubCategories] = useState(getSubCategoriesForMainCategory(''));
  
  useEffect(() => {
    if (initialValues) {
      setDate(initialValues.date);
      setStartTime(initialValues.startTime);
      setEndTime(initialValues.endTime);
      setMainCategoryId(initialValues.mainCategoryId);
      setSubCategoryId(initialValues.subCategoryId);
      setDescription(initialValues.description);
    }
  }, [initialValues]);
  
  useEffect(() => {
    if (mainCategoryId) {
      setAvailableSubCategories(getSubCategoriesForMainCategory(mainCategoryId));
      setSubCategoryId(''); // Reset sub-category when main category changes
    }
  }, [mainCategoryId, getSubCategoriesForMainCategory]);
  
  const calculateDuration = (start: string, end: string): number => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const duration = calculateDuration(startTime, endTime);
    
    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }
    
    const timeEntryData = {
      userId: currentUser.id,
      date,
      startTime,
      endTime,
      mainCategoryId,
      subCategoryId,
      description,
      duration
    };
    
    if (isEditing && initialValues) {
      updateTimeEntry({
        ...timeEntryData,
        id: initialValues.id,
        createdAt: initialValues.createdAt,
        updatedAt: new Date().toISOString()
      });
    } else {
      addTimeEntry(timeEntryData);
    }
    
    if (onSuccess) {
      onSuccess();
    }
    
    // Reset form if not editing
    if (!isEditing) {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('17:00');
      setMainCategoryId('');
      setSubCategoryId('');
      setDescription('');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Time Entry' : 'Add Time Entry'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your time entry details' 
            : 'Record the time you spent on a task'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mainCategory">Main Category</Label>
              <Select 
                value={mainCategoryId} 
                onValueChange={setMainCategoryId}
              >
                <SelectTrigger id="mainCategory">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub Category</Label>
              <Select 
                value={subCategoryId} 
                onValueChange={setSubCategoryId}
                disabled={!mainCategoryId}
              >
                <SelectTrigger id="subCategory">
                  <SelectValue placeholder={mainCategoryId ? "Select a sub-category" : "Select a main category first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you worked on"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          {isEditing && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onSuccess && onSuccess()}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={!mainCategoryId || !subCategoryId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isEditing ? 'Update Entry' : 'Add Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TimeEntryForm;
