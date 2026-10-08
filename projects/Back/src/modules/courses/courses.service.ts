import { supabaseAdmin } from '../../config/supabase'

export class CoursesService {
  static async getAllCourses() {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*, categories(*, docs(*))')
      .order('order', { ascending: true })

    if (error) throw new Error(error.message)
    return (data || []).map((c) => this.formatCourse(c))
  }

  static async getCourseByIdOrSlug(idOrSlug: string) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*, categories(*, docs(*))')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .single()

    if (error || !data) return null
    return this.formatCourse(data)
  }

  static async createCourse(dto: any) {
    const courseId = dto.id || `course-${dto.slug || Date.now()}`
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert([
        {
          id: courseId,
          slug: dto.slug || courseId,
          title: dto.title,
          description: dto.description || '',
          badge: dto.badge || 'PRO',
          icon: dto.icon || '📘',
          order: dto.order || 0,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return this.formatCourse({ ...data, categories: [] })
  }

  static async updateCourse(id: string, dto: any) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, categories(*, docs(*))')
      .single()

    if (error) throw new Error(error.message)
    return this.formatCourse(data)
  }

  static async deleteCourse(id: string) {
    const { error } = await supabaseAdmin.from('courses').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  }

  static async getCategories(courseId?: string) {
    let query = supabaseAdmin.from('categories').select('*, docs(*)').order('order', { ascending: true })
    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data || []).map((cat) => this.formatCategory(cat))
  }

  static async createCategory(dto: any) {
    const catId = dto.id || `cat-${Date.now()}`
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([
        {
          id: catId,
          course_id: dto.courseId,
          title: dto.title,
          description: dto.description || '',
          icon: dto.icon || '📁',
          order: dto.order || 0,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return this.formatCategory({ ...data, docs: [] })
  }

  static async updateCategory(id: string, dto: any) {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, docs(*)')
      .single()

    if (error) throw new Error(error.message)
    return this.formatCategory(data)
  }

  static async deleteCategory(id: string) {
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  }

  static async getDocById(id: string) {
    const { data, error } = await supabaseAdmin.from('docs').select('*').eq('id', id).single()
    if (error || !data) return null
    return this.formatDocItem(data)
  }

  static async createDoc(dto: any) {
    const docId = dto.id || `doc-${Date.now()}`
    const { data, error } = await supabaseAdmin
      .from('docs')
      .insert([
        {
          id: docId,
          category_id: dto.categoryId,
          title: dto.title,
          description: dto.description || '',
          content: dto.content || [],
          tags: dto.tags || [],
          interactive_flashcards: dto.interactiveFlashcards || null,
          quiz_questions: dto.quizQuestions || null,
          order: dto.order || 0,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return this.formatDocItem(data)
  }

  static async updateDoc(id: string, dto: any) {
    const updateData: any = {
      updated_at: new Date().toISOString(),
      ...(dto.title && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.interactiveFlashcards !== undefined && { interactive_flashcards: dto.interactiveFlashcards }),
      ...(dto.quizQuestions !== undefined && { quiz_questions: dto.quizQuestions }),
      ...(dto.order !== undefined && { order: dto.order }),
    }

    const { data, error } = await supabaseAdmin
      .from('docs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return this.formatDocItem(data)
  }

  static async deleteDoc(id: string) {
    const { error } = await supabaseAdmin.from('docs').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  }

  static async importCourse(courseData: any, overwrite = false) {
    let slug = courseData.slug || `course-${Date.now()}`
    let courseId = courseData.id || `course-${slug}`

    // Проверяем, существует ли уже курс с таким id или slug
    const existing = (await this.getCourseByIdOrSlug(courseId).catch(() => null))
      || (await this.getCourseByIdOrSlug(slug).catch(() => null))

    if (existing) {
      if (overwrite) {
        courseId = existing.id
        slug = existing.slug
        // Очищаем старые категории и статьи курса для чистой перезаписи
        const { data: oldCats } = await supabaseAdmin.from('categories').select('id').eq('course_id', courseId)
        if (oldCats && oldCats.length > 0) {
          const oldCatIds = oldCats.map((c: any) => c.id)
          await supabaseAdmin.from('docs').delete().in('category_id', oldCatIds)
          await supabaseAdmin.from('categories').delete().eq('course_id', courseId)
        }
        await supabaseAdmin
          .from('courses')
          .update({
            title: courseData.title,
            description: courseData.description || '',
            badge: courseData.badge || 'PRO',
            icon: courseData.icon || '📘',
            order: courseData.order || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', courseId)
      } else {
        // Создаем копию с уникальным slug и id
        const suffix = Math.random().toString(36).substring(2, 7)
        slug = `${slug}-copy-${suffix}`
        courseId = `course-${slug}`
        await supabaseAdmin.from('courses').insert([
          {
            id: courseId,
            slug,
            title: `${courseData.title} (Копия)`,
            description: courseData.description || '',
            badge: courseData.badge || 'PRO',
            icon: courseData.icon || '📘',
            order: (courseData.order || 0) + 1,
          },
        ])
      }
    } else {
      await supabaseAdmin.from('courses').insert([
        {
          id: courseId,
          slug,
          title: courseData.title,
          description: courseData.description || '',
          badge: courseData.badge || 'PRO',
          icon: courseData.icon || '📘',
          order: courseData.order || 0,
        },
      ])
    }

    // Сохраняем модули и статьи
    const modules = courseData.modules || []
    for (let catIdx = 0; catIdx < modules.length; catIdx++) {
      const cat = modules[catIdx]
      const catId = overwrite && cat.id ? cat.id : `cat-${Date.now()}-${catIdx}-${Math.random().toString(36).substring(2, 5)}`
      await supabaseAdmin.from('categories').insert([
        {
          id: catId,
          course_id: courseId,
          title: cat.title || `Модуль ${catIdx + 1}`,
          description: cat.description || '',
          icon: cat.icon || '📁',
          order: catIdx + 1,
        },
      ])

      const items = cat.items || []
      for (let docIdx = 0; docIdx < items.length; docIdx++) {
        const item = items[docIdx]
        const docId = overwrite && item.id ? item.id : `doc-${Date.now()}-${catIdx}-${docIdx}-${Math.random().toString(36).substring(2, 5)}`
        await supabaseAdmin.from('docs').insert([
          {
            id: docId,
            category_id: catId,
            title: item.title || `Глава ${docIdx + 1}`,
            description: item.description || '',
            content: item.sections || item.content || [],
            tags: item.tags || [],
            interactive_flashcards: item.flashcard || item.interactive_flashcards || null,
            quiz_questions: item.quiz || item.quiz_questions || null,
            order: docIdx + 1,
          },
        ])
      }
    }

    return this.getCourseByIdOrSlug(courseId)
  }

  private static formatCourse(course: any) {
    const formattedCategories = (course.categories || []).map((c: any) => this.formatCategory(c))
    const totalChapters = formattedCategories.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0)

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      badge: course.badge || 'PRO',
      icon: course.icon || '📘',
      order: course.order || 0,
      modulesCount: formattedCategories.length,
      chaptersCount: totalChapters,
      modules: formattedCategories,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    }
  }

  private static formatCategory(category: any) {
    const items = (category.docs || []).map((d: any) => this.formatDocItem(d))
    return {
      id: category.id,
      code: String(category.order || 1).padStart(2, '0'),
      title: category.title,
      icon: category.icon || '📁',
      description: category.description,
      progressPercent: 0,
      courseId: category.course_id,
      items,
    }
  }

  private static formatDocItem(doc: any) {
    let flashcard = doc.interactive_flashcards
    if (Array.isArray(flashcard)) flashcard = flashcard[0]

    let quiz = doc.quiz_questions
    if (Array.isArray(quiz)) quiz = quiz[0]

    let sections = doc.content
    if (!Array.isArray(sections)) {
      sections = typeof sections === 'string' ? [{ id: 'sec-1', title: doc.title, level: 2, text: sections }] : []
    }

    return {
      id: doc.id,
      categoryId: doc.category_id,
      code: `01.${doc.order || 1}`,
      title: doc.title,
      description: doc.description || '',
      status: 'pending',
      readTimeMinutes: 5,
      updatedAt: doc.updated_at ? doc.updated_at.split('T')[0] : '2026-10-08',
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      usefulCount: 0,
      notUsefulCount: 0,
      flashcard,
      quiz,
      sections,
    }
  }
}
