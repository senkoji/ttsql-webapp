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
  sqlformat: z.string().optional(),
  sqlcontent: z.string().min(1, {
    message: "分析したい内容を入力してください",
  }),
  userId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.sqlformat && !data.userId) {
    // sqlformat と userId 両方が未入力の場合
    ctx.addIssue({
      code: 'custom',
      path: ['sqlformat'],
      message: "DBスキーマ情報、または過去に取得したUserIDを入力してください",
    });

    ctx.addIssue({
      code: 'custom',
      path: ['userId'],
      message: "DBスキーマ情報、または過去に取得したUserIDを入力してください",
    });
  }
});

export default function Home() {
  const [responseMessage, setResponseMessage] = useState({ sql_query: "", user_id: "" });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedSqlFormat = values.sqlformat?.replace(/\r\n|\r|\n/g, "") || "";
    const formattedSqlContent = values.sqlcontent.replace(/\r\n|\r|\n/g, "");

    axios.post('http://127.0.0.1:8000/hoge', {
        sqlformat: formattedSqlFormat,
        sqlcontent: formattedSqlContent,
        user_id: values.userId
      })
      .then(response => {
        // レスポンスがJSON形式であることを確認し、sql_queryとuser_idを保存
        if (response.headers['content-type'].includes('application/json')) {
          setResponseMessage({
            sql_query: JSON.stringify(response.data.sql_query),
            user_id: response.data.user_id  // user_idを追加
          });
        } else {
          setResponseMessage({ sql_query: "レスポンスがJSON形式ではありません。", user_id: "" });
        }
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.headers['content-type'].includes('application/json')) {
          // エラー時のレスポンスデータをオブジェクトとしてセット
          setResponseMessage({
            sql_query: JSON.stringify(error.response.data.detail || "エラーが発生しました。"),
            user_id: ""
          });
        } else {
          console.error('送信エラー:', error);
          // エラー時のデフォルトメッセージをオブジェクトとしてセット
          setResponseMessage({
            sql_query: "エラーが発生しました。",
            user_id: ""
          });
        }
      });
    }


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqlformat: "",
      sqlcontent: "",
      userId: "", // 新しいフィールドのデフォルト値
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
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User IDを持っている場合は、こちらにUserIDを入力してください。</FormLabel>
                <Textarea placeholder="User ID" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">送信</Button>
        </form>
      </Form>

      {responseMessage.sql_query && (
        <div className="response-message">
          <h3>回答:</h3>
          <p>
            {responseMessage.sql_query
              .split(/\s\s+/)                // 連続するスペースを分割する
              .map((line: string, index: number) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))
            }
          </p>
          {responseMessage.user_id && (
            <>
              <br />
              <p>あなたのUser IDは {responseMessage.user_id} です。</p>
            </>
          )}
        </div>
      )}
      </main>
  )
}