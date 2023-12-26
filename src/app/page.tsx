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

import axios from "axios";
import React, { useEffect, useState } from "react";

const formSchema = z.object({
  sqlformat: z.string().min(1, {
    message: "DBスキーマ情報を入力してください",
  }),
  sqlcontent: z.string().min(1, {
    message: "分析したい内容を入力してください",
  }),
})

export default function Home() {
  const [responseMessage, setResponseMessage] = useState("");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedSqlFormat = values.sqlformat.replace(/\r\n|\r|\n/g, "");
    const formattedSqlContent = values.sqlcontent.replace(/\r\n|\r|\n/g, "");

    axios.post('http://127.0.0.1:8000/hoge', {
        sqlformat: formattedSqlFormat,
        sqlcontent: formattedSqlContent
      })
      .then(response => {
        // レスポンスがJSON形式であることを確認
        if (response.headers['content-type'].includes('application/json')) {
          setResponseMessage(JSON.stringify(response.data));
        } else {
          setResponseMessage("レスポンスがJSON形式ではありません。");
        }
      })
      .catch(error => {
        // エラー時にもJSON形式であることを確認
        if (error.response && error.response.data && error.response.headers['content-type'].includes('application/json')) {
          setResponseMessage(JSON.stringify(error.response.data));
        } else {
          console.error('送信エラー:', error);
          setResponseMessage("エラーが発生しました。");
        }
      });

    }


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqlformat: "",
      sqlcontent: "",
    },
  })

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

      {responseMessage && (
        <div className="response-message">
          <h3>回答:</h3>
          <p>
            {(() => {
              try {
                const parsed = JSON.parse(responseMessage);
                return parsed.sql_query
                  .split(/\s\s+/)                // 連続するスペースを分割する
                  .map((line: string, index: string) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ));
              } catch (e) {
                // JSONが解析できなかった場合のエラーメッセージ
                return <span>サーバーからのレスポンスを表示できません。</span>;
              }
            })()}
          </p>
        </div>
      )}
      </main>
  )
}