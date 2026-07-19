import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <Helmet>
        <title>404 - Page Not Found | AgroDex</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>

      <motion.div
        className="flex flex-col items-center text-center max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 p-4">
          <FileQuestion className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-6xl sm:text-7xl font-extrabold text-gray-900 dark:text-white mb-3">
          404
        </h1>
        <p className="text-xl font-semibold text-gray-700 dark:text-slate-300 mb-2">
          Page not found
        </p>
        <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/">
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold px-6"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
