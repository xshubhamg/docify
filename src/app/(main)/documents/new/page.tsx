import UploadForm from "@/components/UploadForm";

const NewBookPage = () => {
  return (
    <main className="wrapper container">
      <div className="mx-auto max-w-180 space-y-10">
        <section className="flex flex-col gap-5">
          <h1 className="page-title-xl">Add new Book</h1>
          <p className="subtitle">
            Upload your documents to generate insightful facts and learn from
            them.
          </p>
        </section>

        <UploadForm />
      </div>
    </main>
  );
};

export default NewBookPage;
