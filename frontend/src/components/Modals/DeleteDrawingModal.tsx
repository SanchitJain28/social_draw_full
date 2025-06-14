import { AlertTriangle } from "lucide-react";

interface DeleteDrawingModalProps {
  showDeleteConfirm: boolean;
  deleteDrawing: () => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

export default function DeleteDrawingModal({
  showDeleteConfirm,
  deleteDrawing,
  setShowDeleteConfirm,
}: DeleteDrawingModalProps) {
  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Delete Drawing
                </h3>
                <p className="text-sm text-slate-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete This will permanently remove the
              drawing and all its content.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={deleteDrawing}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
