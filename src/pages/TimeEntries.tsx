
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import TimeEntryForm from '@/components/TimeEntryForm';
import TimeEntryList from '@/components/TimeEntryList';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@/types';

const TimeEntries: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserTimeEntries, deleteTimeEntry } = useData();
  const [activeTab, setActiveTab] = useState('view');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  if (!currentUser) {
    return null;
  }
  
  const userEntries = getUserTimeEntries(currentUser.id);
  
  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setActiveTab('edit');
  };
  
  const handleDelete = (id: string) => {
    deleteTimeEntry(id);
  };
  
  const handleEditSuccess = () => {
    setEditingEntry(null);
    setActiveTab('view');
  };
  
  const handleAddSuccess = () => {
    setActiveTab('view');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Time Entries</h1>
          {activeTab === 'view' && (
            <Button 
              onClick={() => setActiveTab('add')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Entry
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="view">View Entries</TabsTrigger>
            <TabsTrigger value="add" disabled={activeTab === 'edit'}>Add Entry</TabsTrigger>
            {activeTab === 'edit' && (
              <TabsTrigger value="edit">Edit Entry</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="view" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                {userEntries.length > 0 ? (
                  <TimeEntryList 
                    entries={userEntries}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="text-center py-12">
                    <ListFilter className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No time entries yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Get started by adding your first time entry.
                    </p>
                    <Button
                      onClick={() => setActiveTab('add')}
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Time Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add">
            <TimeEntryForm onSuccess={handleAddSuccess} />
          </TabsContent>
          
          <TabsContent value="edit">
            {editingEntry && (
              <TimeEntryForm 
                initialValues={editingEntry}
                onSuccess={handleEditSuccess}
                isEditing={true}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TimeEntries;
