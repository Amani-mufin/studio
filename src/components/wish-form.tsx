'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { WishCardData } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit } from 'lucide-react';
import { ColorPicker } from './color-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  wish: z.string().min(1, 'A wish is required.'),
  name: z.string().min(1, 'Your name is required.'),
  imageUrl: z.string().optional(),
  style: z.object({
    backgroundColor: z.string(),
    textColor: z.string(),
    fontFamily: z.string(),
    fontSize: z.number(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface WishFormProps {
  cardData?: WishCardData;
  onSave: (data: any) => void;
}

const FONT_OPTIONS = [
  { label: 'Body (Inter)', value: 'Inter, sans-serif' },
  { label: 'Headline (Space Grotesk)', value: 'Space Grotesk, sans-serif' },
  { label: 'Serif', value: 'serif' },
];

export function WishForm({ cardData, onSave }: WishFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!cardData;

  const defaultValues: FormValues = {
    wish: cardData?.wish ?? '',
    name: cardData?.name ?? '',
    imageUrl: cardData?.imageUrl ?? '',
    style: cardData?.style ?? {
      backgroundColor: '#111827',
      textColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
    },
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      onSave({ ...cardData, ...values });
    } else {
      onSave(values);
    }
    setIsOpen(false);
    form.reset(defaultValues);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" aria-label="Edit card">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create a Wish
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Wish' : 'Create a Wish'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your wish.' : 'Share a wish for the memory board.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="wish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Wish</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share your heartfelt wish..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Photo (Optional)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </FormControl>
            </FormItem>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Customize Card</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="style.backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <ColorPicker label="Background" {...field} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style.textColor"
                  render={({ field }) => (
                    <FormItem>
                      <ColorPicker label="Text" {...field} />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="style.fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FONT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="style.fontSize"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <Label>Font Size: {value}px</Label>
                    <Slider
                      min={12}
                      max={24}
                      step={1}
                      defaultValue={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                    />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">Save Wish</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
