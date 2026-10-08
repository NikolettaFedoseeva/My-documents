import { Router, Request, Response } from 'express'
import { CoursesService } from './courses.service'
import { authMiddleware, requireRoles } from '../../middlewares/auth.middleware'

export const coursesRouter = Router()

// #region Публичные маршруты
coursesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const courses = await CoursesService.getAllCourses()
    res.json(courses)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await CoursesService.getCategories(req.query.courseId as string)
    res.json(categories)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.get('/docs/:id', async (req: Request, res: Response) => {
  try {
    const doc = await CoursesService.getDocById(req.params.id)
    if (!doc) return res.status(404).json({ success: false, errorMessage: 'Статья не найдена' })
    res.json(doc)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await CoursesService.getCourseByIdOrSlug(req.params.id)
    if (!course) return res.status(404).json({ success: false, errorMessage: 'Курс не найден' })
    res.json(course)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})
// #endregion Публичные маршруты

// #region Защищенные маршруты (автор / админ)
coursesRouter.post('/', authMiddleware, requireRoles('admin', 'author'), async (req: Request, res: Response) => {
  try {
    const course = await CoursesService.createCourse(req.body)
    res.status(201).json({ success: true, course })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.put('/:id', authMiddleware, requireRoles('admin', 'author'), async (req: Request, res: Response) => {
  try {
    const course = await CoursesService.updateCourse(req.params.id, req.body)
    res.json({ success: true, course })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.delete('/:id', authMiddleware, requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    await CoursesService.deleteCourse(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.post('/categories', authMiddleware, requireRoles('admin', 'author'), async (req: Request, res: Response) => {
  try {
    const category = await CoursesService.createCategory(req.body)
    res.status(201).json({ success: true, category })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.put('/categories/:id', authMiddleware, requireRoles('admin', 'author'), async (req: Request, res: Response) => {
  try {
    const category = await CoursesService.updateCategory(req.params.id, req.body)
    res.json({ success: true, category })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.delete('/categories/:id', authMiddleware, requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    await CoursesService.deleteCategory(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.post('/docs', authMiddleware, requireRoles('admin', 'author'), async (req: Request, res: Response) => {
  try {
    const doc = await CoursesService.createDoc(req.body)
    res.status(201).json({ success: true, doc })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.put('/docs/:id', authMiddleware, requireRoles('admin', 'author'), async (req: Request, res: Response) => {
  try {
    const doc = await CoursesService.updateDoc(req.params.id, req.body)
    res.json({ success: true, doc })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.delete('/docs/:id', authMiddleware, requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    await CoursesService.deleteDoc(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

coursesRouter.post('/import', async (req: Request, res: Response) => {
  try {
    const { course, overwrite } = req.body
    if (!course) {
      return res.status(400).json({ success: false, errorMessage: 'Данные курса не переданы' })
    }
    const imported = await CoursesService.importCourse(course, Boolean(overwrite))
    res.status(201).json({ success: true, course: imported })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})
// #endregion Защищенные маршруты
