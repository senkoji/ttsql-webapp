"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  sqlformat: z.string().min(1, {
    message: "DBスキーマ情報を入力してください",
  }),
  sqlcontent: z.string().min(1, {
    message: "分析したい内容を入力してください",
  }),
})

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqlformat: "",
      sqlcontent: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert('送信完了しました');
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 lg:px-24 py-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="sqlformat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分析対象DBのスキーマを教えてください。</FormLabel>
                <Textarea placeholder="ここにDBスキーマ情報を入力してください" {...field} />
                <FormDescription>
                  注：行の情報とテーブルの関係などを入力する欄です。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sqlcontent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SQLで分析したい内容を教えてください。</FormLabel>
                <Textarea placeholder="ここに分析したい内容を入力してください" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">送信</Button>
        </form>
      </Form>
      </main>
  )
}