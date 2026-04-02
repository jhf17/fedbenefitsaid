<Route path="/training" element={<Course />} />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reference" element={<Reference />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <Course />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/quiz/:topicId"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthContext.Provider>
  )
}
