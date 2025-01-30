package main

import (
	"fmt"
	"html/template"
	"io/fs"
	"net/http"
	"os"
)

var (
	PORT        string
	LogsDirName string
	LogsDir     fs.FS
	ADMIN_PASS  string
)

const loginHTML = `
<!DOCTYPE html>
<html>
<body>
    <form method="POST" action="/login">
        <input type="password" name="password" placeholder="Enter admin password">
        <input type="submit" value="Login">
    </form>
</body>
</html>
`

func init() {
	if PORT = os.Getenv("PORT"); PORT == "" {
		PORT = "8000"
	}

	if LogsDirName = os.Getenv("LOGS_DIR_NAME"); LogsDirName == "" {
		LogsDirName = "logs"
	}

	if ADMIN_PASS = os.Getenv("ADMIN_PASS"); ADMIN_PASS == "" {
		ADMIN_PASS = "admin"
	}

	LogsDir = os.DirFS(LogsDirName)
}

func main() {
	loginTmpl := template.Must(template.New("login").Parse(loginHTML))

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			if r.FormValue("password") == ADMIN_PASS {
				cookie := &http.Cookie{
					Name:     "admin",
					Value:    "true",
					MaxAge:   3600, // 1 hour
					HttpOnly: true,
				}
				http.SetCookie(w, cookie)
				http.Redirect(w, r, "/", http.StatusSeeOther)
				return
			}
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		loginTmpl.Execute(w, nil)
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("admin")
		if err != nil || cookie.Value != "true" {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		fmt.Println("Serving logs")
		http.FileServer(http.FS(LogsDir)).ServeHTTP(w, r)
	})

	fmt.Printf("Listening on port %s\n", PORT)
	if err := http.ListenAndServe(fmt.Sprintf("0.0.0.0:%s", PORT), nil); err != nil {
		fmt.Printf("Server failed to start: %v\n", err)
		os.Exit(1)
	}
}
