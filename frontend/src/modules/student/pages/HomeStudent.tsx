"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "../../auth/Hooks/useAuth"
import { useStudentCourseContext } from "../../courses/hooks/useCourse"
import CardCourse from "../components/CardCourse"
import { authStorage } from "../../../shared/Utils/authStorage"
import ViewCategories from "../../../shared/Components/AuthNavbar/ViewCategories"
import { gsap } from "gsap"

import "../Styles/HomeStudent.css"
import { RiMenuSearchLine } from "react-icons/ri"

export default function HomeStudent() {
  const { user } = useUser()
  const { courses, refreshCoursesStudent } = useStudentCourseContext()

  // Panel de categorías
  const [viewCategories, setViewCategories] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const coursesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Header entrance animation
    tl.fromTo(headerRef.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
      .fromTo(
        titleRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4",
      )
      .fromTo(
        paragraphRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3",
      )
      .fromTo(
        filterButtonRef.current,
        { opacity: 0, scale: 0.8, rotation: -180 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.2",
      )

    // Courses container entrance
    if (coursesContainerRef.current) {
      gsap.fromTo(
        coursesContainerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.3 },
      )
    }
  }, [])

  useEffect(() => {
    if (courses.length > 0 && coursesContainerRef.current) {
      const cards = coursesContainerRef.current.children
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
        },
      )
    }
  }, [courses])





  // Evitar sobrescribir filtros: solo recarga si no hay nada en contexto ni en storage
  useEffect(() => {
    const storedCourses = authStorage.getCoursesStudent()
    if (!courses.length && (!storedCourses || storedCourses.length === 0)) {
      refreshCoursesStudent()
    }
  }, [courses, refreshCoursesStudent])

  // Debug opcional
  useEffect(() => {
    console.log("HomeStudent - Courses updated:", courses.length, "courses")
  }, [courses])

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    if (!viewCategories) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setViewCategories(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [viewCategories])

  // Cerrar con ESC
  useEffect(() => {
    if (!viewCategories) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewCategories(false)
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [viewCategories])

  return (
    <div className="container-home-user">

      <div className="home-header" ref={headerRef}>
        <div className="container-info-header-user">
          <h1 className="home-title" ref={titleRef}>
            Bienvenid@ {user?.name}
          </h1>
          <p className="home-paragraph" ref={paragraphRef}>
            Selecciona un curso para comenzar
          </p>
          {/* Botón de categorías (misma UX que en AuthNavbar/TeacherDashboard) */}
          <button
          style={{'color':'#000'}}
            ref={filterButtonRef}
            className="icon-filter-categories"
            onClick={() => setViewCategories((v) => !v)}
            aria-expanded={viewCategories}
            aria-controls="panel-categorias-student"
            title="Filtrar por categoría"
          >
            <RiMenuSearchLine />
          </button>
        </div>
      </div>

      {/* Panel de categorías */}
      {viewCategories && (
        <div id="panel-categorias-student" ref={categoriesRef}>
          <ViewCategories />
        </div>
      )}

      <div className="container-courses" ref={coursesContainerRef}>
        {courses.map((course) => (
          <CardCourse
            key={course.id}
            id={course.id}
            name={course.name}
            description={course.description}
            image={course.image}
            category={course.category}
            palette={course.palette}
            status={"status" in course ? course.status : undefined}
          />
        ))}
      </div>
    </div>
  )
}
