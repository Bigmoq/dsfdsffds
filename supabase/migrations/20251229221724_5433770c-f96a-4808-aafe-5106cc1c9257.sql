-- Allow admins to view all vendor applications
CREATE POLICY "Admins can view all applications"
ON public.vendor_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update vendor applications (approve/reject)
CREATE POLICY "Admins can update applications"
ON public.vendor_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));