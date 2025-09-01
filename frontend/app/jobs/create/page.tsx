import JobCreationForm from "@/components/create-job-post";


export default function CreateJobPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a New Job Post</h1>
      <JobCreationForm />
    </div>
  );
}
