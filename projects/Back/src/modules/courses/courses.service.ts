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
