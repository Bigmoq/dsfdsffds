// Category background images
import makeupImg from '@/assets/categories/makeup.jpg';
import photographyImg from '@/assets/categories/photography.jpg';
import hennaImg from '@/assets/categories/henna.jpg';
import hairstyleImg from '@/assets/categories/hairstyle.jpg';
import singerImg from '@/assets/categories/singer.jpg';
import flowersImg from '@/assets/categories/flowers.jpg';
import cateringImg from '@/assets/categories/catering.jpg';
import groomImg from '@/assets/categories/groom.jpg';

export const categoryImages: Record<string, string> = {
  // Women's categories
  'hair': hairstyleImg,
  'makeup': makeupImg,
  'henna': hennaImg,
  'singers': singerImg,
  'photographer-w': photographyImg,
  'buffet': cateringImg,
  'kosha': flowersImg,
  
  // Men's categories
  'photographer-m': photographyImg,
  'incense': groomImg,
  'sabbabeen': cateringImg,
  'ardah': singerImg,
};
