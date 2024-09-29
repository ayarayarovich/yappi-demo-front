import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const SEARCH_RESPONSE_SCHEME = z.union([
  z.object({
    is_duplicate: z.literal(true),
    duplicate_for: z.string(),
  }),
  z.object({
    is_duplicate: z.literal(false),
  }),
]);

const FORM_SCHEME = z.object({
  link: z.string().url(),
});

function App() {
  const searchMutation = useMutation({
    mutationFn: async (payload: { link: string }) => {
      const response = await axios.post("https://yappi-ai.ayarayarovich.ru/check-video-duplicate", payload);
      const data = SEARCH_RESPONSE_SCHEME.parse(response.data);
      return data;
    },
  });

  const form = useForm<z.infer<typeof FORM_SCHEME>>({
    resolver: zodResolver(FORM_SCHEME),
  });

  const handleSubmit = form.handleSubmit(async (v) => {
    await searchMutation.mutateAsync(v);
  });

  return (
    <div className="px-4">
      <h1 className="text-center text-4xl font-bold font-unbounded my-16">Electteam</h1>
      <h2 className="text-center text-2xl font-bold font-sans my-4">Поиск дубликатов Yappy</h2>
      <div className="container mx-auto mt-4 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-2">
          <Controller
            control={form.control}
            name="link"
            render={({ field, fieldState, formState }) => (
              <Input
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                isDisabled={formState.isSubmitting}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label="URL видео для поиска"
                className="max-w-md"
              />
            )}
          />
          <Button type="submit" size="lg" className="mt-1.5" isDisabled={form.formState.isSubmitting}>
            Поиск
          </Button>
        </form>

        {!searchMutation.isPending && searchMutation.isSuccess && (
          <>
            {!searchMutation.isSuccess ? (
              <div>загрузка...</div>
            ) : (
              <>
                {searchMutation.data.is_duplicate ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      Оригинал
                      <video controls className="w-[20rem]" src={form.getValues().link} />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      Дубликат
                      <video
                        controls
                        className="w-[20rem]"
                        src={"https://s3.ritm.media/yappy-db-duplicates/" + searchMutation.data.duplicate_for + ".mp4"}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      Видео не дубликат
                      <video controls className="w-[20rem]" src={form.getValues().link} />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
