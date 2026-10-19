import UploadForm from "@/components/UploadForm";

const NewBookPage = () => {
  return (
    <main id="main-content" className="wrapper container">
      <div className="mx-auto max-w-180 space-y-10">
        <section className="flex flex-col gap-5">
          <h1 className="page-title-xl">Add a document</h1>
          <p className="subtitle">
            Upload a PDF, choose a voice, and start a conversation grounded in the text.
          </p>
        </section>

        <UploadForm />
      </div>
    </main>
  );
};

export default NewBookPage;
