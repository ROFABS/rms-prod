import React, { useState, useEffect } from "react";
import { Plus, Save, Trash, Edit2, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { API_URL, CHANNELS_API_URL } from "@/lib/consts/app";

// Type Definitions
interface MenuItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
  main_category_name: string;
}

interface MenuCategory {
  id: number;
  platform: string;
  items: MenuItem[];
}

interface ApiMenuItem {
  main_category_id: string;
  main_category_name: string;
  item: {
    id: string;
    name: string;
    price: number;
    serves_how_many: number;
    availability: {
      available: boolean;
    };
  };
}

interface ApiResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    menu: {
      items_vo: ApiMenuItem[];
    };
  };
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// Utility function to group items by category
const groupItemsByCategory = (items: MenuItem[]): Record<string, MenuItem[]> => {
  return items.reduce((acc, item) => {
    const category = item.main_category_name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
};

// Switch Component
const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => (
  <div
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    onClick={() => !disabled && onChange(!checked)}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </div>
);

const ChannelMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("swiggy");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [menuData, setMenuData] = useState<MenuCategory[]>([
    { id: 1, platform: "swiggy", items: [] },
    { id: 2, platform: "zomato", items: [] }
  ]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${CHANNELS_API_URL}/api/v1/swiggy/items`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      const transformedItems = data.data.menu.items_vo.map(item => ({
        id: parseInt(item.item.id),
        name: item.item.name,
        price: item.item.price,
        quantity: item.item.serves_how_many || 1,
        isAvailable: item.item.availability?.available ?? true,
        main_category_name: item.main_category_name
      }));

      setMenuData(prevData =>
        prevData.map(category =>
          category.platform === "swiggy" ? { ...category, items: transformedItems } : category
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch menu items';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAvailabilityToggle = async (itemId: number, newValue: boolean) => {
    try {
      const endpoint = newValue 
        ? `${CHANNELS_API_URL}/api/v1/${activeTab}/items/instock`
        : `${CHANNELS_API_URL}/api/v1/${activeTab}/items/outofstock`;

      const response = await fetch(`${endpoint}?item_id=${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to update availability: ${response.statusText}`);
      }

      // Update local state only after successful API call
      setMenuData(prevData =>
        prevData.map(category => ({
          ...category,
          items: category.items.map(item =>
            item.id === itemId ? { ...item, isAvailable: newValue } : item
          )
        }))
      );

      // Show success message
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update availability';
      setError(errorMessage);
      
      // Revert the toggle in case of error
      setMenuData(prevData =>
        prevData.map(category => ({
          ...category,
          items: category.items.map(item =>
            item.id === itemId ? { ...item, isAvailable: !newValue } : item
          )
        }))
      );
    }
  };

  const handleItemChange = (itemId: number, field: keyof MenuItem, value: any) => {
    if (field === "isAvailable") {
      handleAvailabilityToggle(itemId, value);
    } else {
      setMenuData(prevData =>
        prevData.map(category => ({
          ...category,
          items: category.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        }))
      );
    }
  };

  const handleDeleteItem = (itemId: number) => {
    setMenuData(prevData =>
      prevData.map(category => ({
        ...category,
        items: category.items.filter(item => item.id !== itemId)
      }))
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const activeCategory = menuData.find(category => category.platform === activeTab);
      if (!activeCategory) return;

      const apiItems = activeCategory.items.map(item => ({
        main_category_id: "53460815",
        main_category_name: item.main_category_name,
        item: {
          id: String(item.id),
          name: item.name,
          price: item.price,
          serves_how_many: item.quantity,
          availability: { available: item.isAvailable }
        }
      }));

      const response = await fetch(`https://628a-103-48-69-250.ngrok-free.app/api/v1/${activeTab}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(apiItems)
      });

      if (!response.ok) {
        throw new Error(`Failed to save changes: ${response.statusText}`);
      }

      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
        setIsEditMode(false);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMenuItems = () => {
    const activeItems = menuData.find(category => category.platform === activeTab)?.items || [];
    const groupedItems = groupItemsByCategory(activeItems);

    return Object.entries(groupedItems).map(([categoryName, items]) => (
      <Card key={categoryName} className="mb-4">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => toggleCategory(categoryName)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              {expandedCategories.has(categoryName) ? 
                <ChevronDown className="w-5 h-5 mr-2" /> : 
                <ChevronRight className="w-5 h-5 mr-2" />
              }
              {categoryName}
              <span className="ml-2 text-sm text-gray-500">
                ({items.length} items)
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        {expandedCategories.has(categoryName) && (
          <CardContent>
            <div className="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-gray-500">
              <div className="col-span-3">Item Name</div>
              <div className="col-span-2">Price (₹)</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-3">Availability</div>
              <div className="col-span-2"></div>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className={`grid grid-cols-12 gap-4 items-center py-2 ${
                  !item.isAvailable ? 'opacity-75' : ''
                }`}>
                  <div className="col-span-3">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                        className="w-full px-2 py-1 border rounded-md text-sm"
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {isEditMode ? (
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, "price", Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded-md text-sm"
                      />
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {isEditMode ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded-md text-sm"
                      />
                    ) : (
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        item.quantity < 10 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.quantity} left
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      checked={item.isAvailable}
                      onChange={(newValue) => handleItemChange(item.id, "isAvailable", newValue)}
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-600">
                      {item.isAvailable ? 'Available' : 'Stopped'}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    {isEditMode && (
                      <button
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Menu Management</h2>
          <div className="space-x-2">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                isEditMode ? 'bg-gray-200' : 'bg-blue-600 text-white'
              }`}
              onClick={() => setIsEditMode(!isEditMode)}
              disabled={isLoading}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {isEditMode ? "Exit Edit Mode" : "Edit Menu"}
            </button>
            {isEditMode && (
              <button
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white flex items-center"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {showSaveSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            Changes saved successfully!
          </div>
        )}

         {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                activeTab === "swiggy" ? 'bg-white shadow' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab("swiggy")}
              disabled={isLoading}
            >
              Swiggy Menu
            </button>
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                activeTab === "zomato" ? 'bg-white shadow' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab("zomato")}
              disabled={isLoading}
            >
              Zomato Menu
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading menu items...</p>
          </div>
        ) : (
          renderMenuItems()
        )}
      </div>
    </div>
  );
};

export default ChannelMenu;