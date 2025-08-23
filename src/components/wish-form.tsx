'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { WishCardData } from '@/lib/types';
import Image from 'next/image';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  wish: z.string().min(1, 'A wish is required.'),
  name: z.string().min(1, 'Your name is required.'),
  imageUrl: z.string().optional(),
  style: z.object({
    background: z.string(),
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

const DEFAULT_IMAGES = [
  'https://asset.cloudinary.com/sirsuccess/image/upload/v1715873243/2074ba736a35c360db8997a4d9bed277.jpg',
  'https://asset.cloudinary.com/sirsuccess/image/upload/v1715873223/64ca296c2634008ad0f107f963d04782.jpg',
  'https://asset.cloudinary.com/sirsuccess/image/upload/v1715873199/dc94b7912a264827d8145e06929d3ee4.jpg',
  'https://i.imgur.com/8p5cW6h.jpeg',
  'https://placehold.co/100x100.png',
  'https://placehold.co/100x100.png',
];

export function WishForm({ cardData, onSave }: WishFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!cardData;

  const defaultValues: FormValues = {
    wish: cardData?.wish ?? '',
    name: cardData?.name ?? '',
    imageUrl: cardData?.imageUrl ?? DEFAULT_IMAGES[0],
    style: cardData?.style ?? {
      background: 'bg-gradient-pink',
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
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {DEFAULT_IMAGES.map((url, index) => (
                        <FormItem key={url} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={url} id={`image-${index}`} className="peer sr-only" />
                          </FormControl>
                          <Label
                            htmlFor={`image-${index}`}
                            className="relative flex items-center justify-center rounded-full border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-20 h-20 overflow-hidden"
                          >
                            <Image src={url} alt={`Default image ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint={index < 3 ? "celebration event" : "man portrait"} />
                          </Label>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Customize Card</h3>
                <FormField
                  control={form.control}
                  name="style.background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Appearance</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: "bg-gradient-pink", label: "Pink" },
                            { value: "bg-gradient-blue", label: "Blue" },
                            { value: "bg-gradient-purple", label: "Purple" },
                            { value: "bg-gradient-green", label: "Green" },
                            { value: "bg-gradient-orange", label: "Orange" },
                            { value: "bg-gradient-teal", label: "Teal" },
                          ].map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => field.onChange(color.value)}
                              className={`p-4 rounded-xl ${color.value} hover:scale-105 transition-transform ${
                                field.value === color.value ? "ring-2 ring-primary" : ""
                              }`}
                              aria-label={`Select ${color.label} gradient`}
                            >
                              <div className="w-full h-8 rounded bg-white/20"></div>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
