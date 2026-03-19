export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  isFreePreview: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  coverUrl: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  accessType: "forever" | "limited";
  accessPeriodDays?: number;
  authorName: string;
  category: string;
  status: string;
  isFeatured: boolean;
  modulesCount: number;
  lessonsCount: number;
  duration: string;
  level: string;
  modules: CourseModule[];
}
